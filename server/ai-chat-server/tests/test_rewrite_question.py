import asyncio
from types import SimpleNamespace

from app.openai_services import llm_service


def test_rewrite_question_accepts_message_model_objects(monkeypatch):
    request = {}

    async def fake_create(**kwargs):
        request.update(kwargs)
        return SimpleNamespace(output_text="How do transfer limits work?")

    monkeypatch.setattr(llm_service.client.responses, "create", fake_create)

    message_history = [
        SimpleNamespace(role="user", content="How do transfers work?"),
        SimpleNamespace(role="assistant", content="Transfers move money."),
    ]

    result = asyncio.run(
        llm_service.rewrite_question(
            user_message="What about limits?",
            message_history=message_history,
        )
    )

    assert result == "How do transfer limits work?"
    assert "user: How do transfers work?" in request["input"]
    assert "assistant: Transfers move money." in request["input"]


def test_expand_search_query_ignores_blank_input(monkeypatch):
    async def fail_if_called(**kwargs):
        raise AssertionError("OpenAI should not be called for blank input")

    monkeypatch.setattr(llm_service.client.responses, "create", fail_if_called)

    result = asyncio.run(llm_service.expand_search_query("   "))

    assert result == ""