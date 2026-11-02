from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    openai_api_key: str = Field(
        validation_alias=AliasChoices("OPENAI_API_KEY", "openai_api_key"),
    )
    openai_model: str = Field(
        validation_alias=AliasChoices("OPENAI_MODEL", "openai_model"),
    )
    openai_max_tokens: int = Field(
        validation_alias=AliasChoices(
            "OPENAI_MAX_OUTPUT_TOKENS",
            "OPENAI_MAX_TOKENS",
            "openai_max_tokens",
        ),
        gt=0,
    )

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings(
    openai_api_key=os.environ["OPENAI_API_KEY"],
    openai_model=os.environ["OPENAI_MODEL"],
    openai_max_tokens=int(os.environ["OPENAI_MAX_OUTPUT_TOKENS"]),
)