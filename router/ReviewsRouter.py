from typing import Annotated, Optional, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.orm import selectinload

from model.database import SessionDep
from model.Review import Review
from model.User import User

from router.Authentication import get_current_user


router = APIRouter(prefix="/my", tags=["reviews"])


class MyReviewOut(BaseModel):
    reviewId: int
    review: Optional[str]
    reviewRating: float
    reviewRatingCount: Optional[int]
    kind: Literal["movie", "song"]
    title: str
    cover: Optional[str] = None
    movieId: Optional[int] = None
    songId: Optional[int] = None


@router.get("/reviews", response_model=list[MyReviewOut])
async def get_my_reviews(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    stmt = (
        select(Review)
        .where(Review.user_id == current_user.user_id)
        .options(selectinload(Review.movie), selectinload(Review.song))
        .order_by(Review.review_id.desc())
    )

    reviews = session.exec(stmt).all()

    out: list[MyReviewOut] = []
    for r in reviews:
        if r.movie_id is not None and r.movie is not None:
            out.append(
                MyReviewOut(
                    reviewId=r.review_id,
                    review=r.review,
                    reviewRating=r.review_rating,
                    reviewRatingCount=r.review_rating_count,
                    kind="movie",
                    title=r.movie.movie_name,
                    cover=r.movie.cover,
                    movieId=r.movie_id,
                    songId=None,
                )
            )
        elif r.song_id is not None and r.song is not None:
            out.append(
                MyReviewOut(
                    reviewId=r.review_id,
                    review=r.review,
                    reviewRating=r.review_rating,
                    reviewRatingCount=r.review_rating_count,
                    kind="song",
                    title=r.song.song_name,
                    cover=r.song.cover,
                    movieId=None,
                    songId=r.song_id,
                )
            )

    return out


@router.post("/reviews/{song_id}")
async def song_review(
	session: SessionDep,
	current_user_id: int,
	current_song_id: int,
	review_body: str,
):
	stmt = (select(Review).where(Review.review_id > 0))
	list_of_reviews = session.exec(stmt).all()
	review = Review(
		review_id = len(list_of_reviews) + 1,
		review = review_body,
		user_id = current_user_id,
		song_id = current_song_id,)
	session.add(review)
	session.commit()
	return review


@router.post("/reviews/{movie_id}")
async def movie_review(
	session: SessionDep,
	current_user_id: int,
	current_movie_id: int,
	review_body: str,
):
	stmt = (select(Review).where(Review.review_id > 0))
	list_of_reviews = session.exec(stmt).all()
	review = Review(
		review_id = len(list_of_reviews) + 1,
		review = review_body,
		user_id = current_user_id,
		song_id = None,
		movie_id = current_movie_id,)
	session.add(review)
	session.commit()
	return review
