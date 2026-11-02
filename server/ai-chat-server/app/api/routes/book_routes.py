from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.book_schema import Book, BookCreate
from app.services import book_services

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[Book])
def read_books(db: Session = Depends(get_db)):
    return book_services.get_books(db)


@router.get("/{book_id}", response_model=Book)
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = book_services.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("", response_model=Book)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    return book_services.create_book(db, book)


@router.put("/{book_id}", response_model=Book)
def update_book(book_id: int, book_data: BookCreate, db: Session = Depends(get_db)):
    book = book_services.update_book(db, book_id, book_data)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}", response_model=Book)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = book_services.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return book
