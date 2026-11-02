
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.db import get_db
from app.models.user import User
from app.schemas.user_schema import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    normalized_email = str(request.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if  existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to register with this email",
        )

    user = User(
        email=normalized_email,
        firstname=request.firstname,
        lastname=request.lastname,
        role=request.role,
        hashed_password=hash_password(request.password),
    )
 
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    
    except IntegrityError as exc:
        db.rollback()

        print("Exact database error:", repr(exc.orig))

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to register with this email",
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    normalized_email = str(request.email).strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if (
        user is None
        or not verify_password(
            request.password,
            user.hashed_password,
        )
        or not user.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
