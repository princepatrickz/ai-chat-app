from openai import AsyncOpenAI
from app.config.settings import settings


client = AsyncOpenAI(
    api_key=settings.openai_api_key,
)


async def moderate_content(message: str) -> dict:

    response = await client.moderations.create(
        model="omni-moderation-latest",
        input=message
    )

    result = response.results[0]

    return {
        "flagged": result.flagged,
        "categories": result.categories,
        "category_scores": result.category_scores
    }
