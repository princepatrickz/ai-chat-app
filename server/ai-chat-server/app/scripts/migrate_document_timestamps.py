from sqlalchemy import text

from app.db import engine


TIMESTAMP_COLUMNS = ("created_at", "updated_at")


def migrate_document_timestamps() -> None:
    with engine.begin() as connection:
        column_types = {
            row["column_name"]: row["data_type"]
            for row in connection.execute(
                text(
                    """
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'documents'
                      AND column_name IN ('created_at', 'updated_at')
                    """
                )
            ).mappings()
        }

        for column in TIMESTAMP_COLUMNS:
            data_type = column_types.get(column)
            if data_type == "time with time zone":
                connection.execute(
                    text(
                        f"""
                        ALTER TABLE public.documents
                        ALTER COLUMN {column} TYPE TIMESTAMP WITH TIME ZONE
                        USING (CURRENT_DATE + {column})
                        """
                    )
                )
            elif data_type != "timestamp with time zone":
                raise RuntimeError(
                    f"Unexpected documents.{column} type: {data_type!r}"
                )

    print(
        "Document timestamp columns are now TIMESTAMP WITH TIME ZONE. "
        "Legacy time-only values were assigned the migration date."
    )


if __name__ == "__main__":
    migrate_document_timestamps()