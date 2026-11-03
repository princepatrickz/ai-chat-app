
from pathlib import Path
from openai import AsyncOpenAI
from app.config.settings import settings
from sqlalchemy.orm import Session
import json
import hashlib
import os
from typing import Any
import logging
from openai import AsyncOpenAI
from collections.abc import AsyncGenerator
from openai.types.responses import ResponseInputParam
from typing import Any
from pydantic import ValidationError
from openai.types.responses import ResponseInputParam
from app.schemas.chat_schema import AssistantResponse
from functools import lru_cache
import asyncio
import time
from app.services.tool_services import (
    execute_tool,
    get_available_tools,
)
from app.openai_services.cache_service import (
    get_text_cache,
    set_text_cache,
    redis_client
)

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.openai_api_key)

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
ANSWER_CACHE_TTL = 300  # 5 minutes

NO_CONTEXT_RESPONSE = (
    "I don't have enough information in my knowledge base "
    "to answer that accurately."
)

MAX_TOOL_ROUNDS = 5


@lru_cache(maxsize=8)
def load_prompt(filename: str) -> str:
    prompt_path = PROMPTS_DIR / filename
    return prompt_path.read_text(encoding="utf-8")


async def create_embedding(text: str) -> list[float]:
    model = "text-embedding-3-small"

    # Normalize whitespace so equivalent queries share a cache entry.
    normalized_text = " ".join(text.strip().split())

    # Create a unique key for this model and text.
    text_hash = hashlib.sha256(
        normalized_text.encode("utf-8")
    ).hexdigest()

    cache_key = f"rag:embedding:v1:{model}:{text_hash}"

    # Try Redis first.
    try:
        cached_embedding = await redis_client.get(cache_key)

        if cached_embedding is not None:
            return json.loads(cached_embedding)

    except Exception:
        logger.warning(
            "Embedding cache read failed; calling embedding API.",
            exc_info=True,
        )

    # Cache miss: call OpenAI.
    response = await client.embeddings.create(
        model=model,
        input=normalized_text,
    )

    embedding = response.data[0].embedding

    # Save the embedding for 24 hours.
    try:
        await redis_client.set(
            cache_key,
            json.dumps(embedding),
            ex=86400,
        )

    except Exception:
        logger.warning(
            "Embedding cache write failed.",
            exc_info=True,
        )

    return embedding


async def generate_conversation_title(user_message: str | None) -> str | None:

    instructions = load_prompt("generate_title.txt")

    if not user_message:
            return None

    if not instructions:
        raise ValueError("Failed to load prompt instructions for title generation.")

    response = await client.responses.create(
        model=settings.openai_model,
        instructions=instructions,
        input=user_message,
        max_output_tokens=30
    )

    title = response.output_text.strip()

    if title.upper() == "NONE":
        return None

    return title


async def generate_ai_response(
    question: str,
    history: list[dict[str, Any]],
    context: str,
    current_user: Any = None,
    db: Session | None = None,
) -> AsyncGenerator[str, None]:

    start_time = time.perf_counter()

    # Load cached prompt and retrieve available tools.
    instructions = load_prompt("customer_service.txt")
    tools = get_available_tools(current_user)

    # Prepare input.
    input_items = _prepare_response_input(
        question=question,
        history=history,
        context=context,
    )

    # Answer cache lookup.
    cache_allowed = current_user is None and not tools
    cache_key = None

    if cache_allowed:
        cache_raw = (
            f"{question.strip().lower()}|"
            f"{hashlib.sha256(context.encode()).hexdigest()}|"
            f"{settings.openai_model}"
        )

        cache_key = (
            f"rag:answer:v3:"
            f"{hashlib.sha256(cache_raw.encode()).hexdigest()}"
        )

        cached_answer = await get_cached_answer(cache_key)

        if cached_answer is not None:
            try:
                validated = AssistantResponse.model_validate(
                    {"answer": cached_answer}
                )

                logger.info("Answer cache HIT")
                yield validated.answer
                return

            except ValidationError:
                logger.warning("Invalid cached response. Regenerating.")

    # OpenAI execution.
    for round_number in range(MAX_TOOL_ROUNDS):

        llm_start = time.perf_counter()

        response_stream = await client.responses.create(
            model=settings.openai_model,
            instructions=instructions,
            input=input_items,
            tools=tools,
            tool_choice="auto" if tools else "none",
            max_output_tokens=500,
            store=False,
            stream=True,
        )

        logger.info(
            "LLM stream initialized: %.3fs",
            time.perf_counter() - llm_start,
        )

        completed_items = []
        response_chunks = []

        first_token = True

        async for chunk in response_stream:

            delta = getattr(chunk, "delta", None)

            if delta:
                if first_token:
                    logger.info(
                        "Time to first token: %.3fs",
                        time.perf_counter() - start_time,
                    )
                    first_token = False

                response_chunks.append(delta)

                yield delta

            item = getattr(chunk, "item", None)

            if item is not None:
                completed_items.append(item)

        final_text = "".join(response_chunks)

        function_calls = [
            item
            for item in completed_items
            if getattr(item, "type", None) == "function_call"
        ]

        # Final output validation.
        if not function_calls:

            try:
                validated = AssistantResponse.model_validate(
                    {"answer": final_text}
                )

                final_text = validated.answer

            except ValidationError:
                logger.exception("Generated response failed validation.")

                return

            # Cache validated response.
            if final_text and cache_key is not None:

                if _should_cache_answer(
                    answer=final_text,
                    cache_allowed=cache_allowed,
                    cache_key=cache_key,
                ):
                    asyncio.create_task(
                        cache_answer(
                            cache_key=cache_key,
                            answer=final_text,
                        )
                    )

            logger.info(
                "Total generation time: %.3fs",
                time.perf_counter() - start_time,
            )

            return

        # Execute tool calls.
        for tool_call in function_calls:

            result = _execute_tool_call(
                tool_call=tool_call,
                current_user=current_user,
                db=db,
            )

            _append_tool_result(
                input_items=input_items,
                tool_call=tool_call,
                result=result,
            )

    yield (
        "I couldn't complete that request within the allowed number "
        "of tool operations. Please try again."
    )




async def rewrite_question(user_message: str, message_history: list) -> str:

    if not message_history:
        return user_message.strip()

    history_text = "\n".join(
        f"{message.role}: {message.content}"
        for message in message_history
    )

    instructions = load_prompt("rewrite_question.txt")

    if not instructions:
        raise ValueError("Failed to load prompt instructions for question rewriting.")

    input_text = f"""
    CONVERSATION HISTORY:
    {history_text}

    LATEST USER MESSAGE:
    {user_message}
    """

    response = await client.responses.create(
        model=settings.openai_model,
        instructions=instructions,
        input=input_text,
        max_output_tokens=100
    )

    return response.output_text.strip()


def build_answer_cache_key(
    question: str,
    context: str,
    model: str,
    instructions: str,
    history: list[dict[str, Any]],
) -> str:
    normalized_question = " ".join(question.strip().lower().split())
    
    # Extract only the last user/assistant turn if history exists 
    # to avoid cache misses on growing array sizes.
    recent_history = history[-2:] if history else []

    payload = {
        "question": normalized_question,
        "context_hash": hashlib.sha256(context.encode("utf-8")).hexdigest(),
        "model": model,
        "instructions_hash": hashlib.sha256(instructions.encode("utf-8")).hexdigest(),
        "recent_history": recent_history,
    }

    serialized = json.dumps(
        payload,
        sort_keys=True,
        ensure_ascii=False,
        default=str,
    )

    digest = hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()

    return f"rag:answer:v2:{digest}"



async def get_cached_answer(cache_key: str) -> str | None:
    return await get_text_cache(cache_key)


async def cache_answer(
    cache_key: str,
    answer: str,
) -> None:
    await set_text_cache(
        cache_key,
        answer,
        ttl_seconds=ANSWER_CACHE_TTL,
    )

def _prepare_response_input(
    question: str,
    history: list[dict[str, Any]],
    context: str,
) -> ResponseInputParam:
    input_items = _history_to_input(history)

    input_items.append({
        "role": "user",
        "content": (
            f"RAG CONTEXT:\n{context}\n\n"
            f"CURRENT USER QUESTION:\n{question}"
        ),
    })

    return input_items


def _should_cache_answer(
    answer: str,
    cache_allowed: bool,
    cache_key: str | None,
) -> bool:
    insufficient_information = (
        "I don't have enough information in my knowledge base "
        "to answer that accurately."
    )

    return (
        cache_allowed
        and cache_key is not None
        and bool(answer.strip())
        and insufficient_information.casefold()
        not in answer.casefold()
    )


def _execute_tool_call(
    tool_call: Any,
    current_user: Any,
    db: Session | None,
) -> dict[str, Any]:
    call_name = getattr(tool_call, "name", "")

    if current_user is None:
        return {
            "error": "Authentication is required for this operation."
        }

    if db is None:
        return {
            "error": "Database access is unavailable."
        }

    try:
        arguments = json.loads(
            getattr(tool_call, "arguments", "{}")
        )

        if not isinstance(arguments, dict):
            raise ValueError("Tool arguments must be an object.")

        logger.info("Executing transaction tool: %s", call_name)

        result = execute_tool(
            name=call_name,
            arguments=arguments,
            current_user=current_user,
            db=db,
        )

        logger.info("Tool=%s executed successfully", call_name)

        return result

    except (json.JSONDecodeError, ValueError, PermissionError):
        logger.exception("Tool execution failed: %s", call_name)

        return {
            "error": "The requested operation could not be completed."
        }

    except Exception:
        logger.exception("Tool execution failed: %s", call_name)

        return {
            "error": "The requested operation failed."
        }



def _append_tool_result(
    input_items: ResponseInputParam,
    tool_call: Any,
    result: dict[str, Any],
) -> None:
    call_id = getattr(tool_call, "call_id", "")

    input_items.append({
        "type": "function_call",
        "call_id": call_id,
        "name": getattr(tool_call, "name", ""),
        "arguments": getattr(tool_call, "arguments", "{}"),
    })

    input_items.append({
        "type": "function_call_output",
        "call_id": call_id,
        "output": json.dumps(
            result,
            default=str,
            ensure_ascii=False,
        ),
    })



def _history_to_input(
    history: list[dict[str, Any]],
) -> ResponseInputParam:
    input_items: ResponseInputParam = []

    for message in history:
        role = message.get("role")
        content = message.get("content")

        if role not in ("user", "assistant"):
            continue

        if not isinstance(content, str) or not content.strip():
            continue

        input_items.append({
            "role": role,
            "content": content,
        })

    return input_items