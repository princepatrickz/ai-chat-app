import json
import os
from typing import Any
from redis.asyncio import Redis
import logging

logger = logging.getLogger(__name__)

redis_client = Redis.from_url(
    os.getenv(
        "REDIS_URL",
        "redis://127.0.0.1:6379/0",
    ),
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2,
    retry_on_timeout=False,
)

async def get_cache(key: str) -> Any | None:
    try:
        value = await redis_client.get(key)

        if value is None:
            return None

        return json.loads(value)

    except Exception:
        logger.exception("Failed to read cache: %s", key)
        return None


async def set_cache(
    key: str,
    value: Any,
    ttl_seconds: int = 300,
) -> None:
    try:
        serialized = json.dumps(
            value,
            ensure_ascii=False,
            default=str,
        )

        await redis_client.set(
            key,
            serialized,
            ex=ttl_seconds,
        )

    except Exception:
        logger.exception("Failed to write cache: %s", key)


async def get_text_cache(key: str) -> str | None:
    try:
        value = await redis_client.get(key)

        if value is None:
            return None

        if isinstance(value, bytes):
            value = value.decode("utf-8")

        return value

    except Exception:
        logger.exception("Failed to read text cache: %s", key)
        return None


async def set_text_cache(
    key: str,
    value: str,
    ttl_seconds: int = 300,
) -> None:
    try:
        await redis_client.set(
            key,
            value,
            ex=ttl_seconds,
        )

    except Exception:
        logger.exception("Failed to write text cache: %s", key)


async def close_cache() -> None:
    await redis_client.aclose()