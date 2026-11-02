from pydantic import BaseModel, ConfigDict


class BookBase(BaseModel):
    title: str
    description: str
    author: str
    year: int


class BookCreate(BookBase):
    pass


class Book(BookBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

