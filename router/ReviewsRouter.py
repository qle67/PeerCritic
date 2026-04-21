from typing import Annotated, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.orm import selectinload

from model.database import SessionDep
from model.Review import Review
from model.User import User
from model.Friendship import Friendship
from model.Movie import Movie
from model.Song import Song

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


class FriendReviewOut(BaseModel):
    reviewId: int
    review: Optional[str]
    reviewRating: float
    reviewRatingCount: Optional[int]

    userId: int
    username: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    avatar: Optional[str] = None

    kind: Literal["movie", "song"]
    title: str
    cover: Optional[str] = None
    movieId: Optional[int] = None
    songId: Optional[int] = None


def get_accepted_friend_ids(current_user_id: int, session: SessionDep) -> set[int]:
    friendships = session.exec(
        select(Friendship).where(
            Friendship.status == "accepted",
            (Friendship.requester_id == current_user_id)
            | (Friendship.addressee_id == current_user_id),
        )
    ).all()

    friend_ids: set[int] = set()
    for fr in friendships:
        friend_ids.add(
            fr.addressee_id if fr.requester_id == current_user_id else fr.requester_id
        )

    return friend_ids


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


@router.get("/friends/reviews/movie/{movie_id}", response_model=list[FriendReviewOut])
async def get_friend_reviews_for_movie(
    movie_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    friend_ids = get_accepted_friend_ids(current_user.user_id, session)

    if not friend_ids:
        return []

    movie = session.exec(
        select(Movie)
        .where(Movie.movie_id == movie_id)
        .options(
            selectinload(Movie.reviews)
            .selectinload(Review.user)
            .selectinload(User.profile)
        )
    ).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    friend_reviews = [
        review
        for review in movie.reviews
        if review.user_id is not None and review.user_id in friend_ids
    ]

    out: list[FriendReviewOut] = []
    for review in sorted(friend_reviews, key=lambda r: r.review_id or 0, reverse=True):
        if review.user is None:
            continue

        profile = review.user.profile

        out.append(
            FriendReviewOut(
                reviewId=review.review_id,
                review=review.review,
                reviewRating=review.review_rating,
                reviewRatingCount=review.review_rating_count,
                userId=review.user.user_id,
                username=review.user.username,
                firstName=profile.first_name if profile else None,
                lastName=profile.last_name if profile else None,
                avatar=profile.avatar if profile else None,
                kind="movie",
                title=movie.movie_name,
                cover=movie.cover,
                movieId=movie.movie_id,
                songId=None,
            )
        )

    return out


@router.get("/friends/reviews/song/{song_id}", response_model=list[FriendReviewOut])
async def get_friend_reviews_for_song(
    song_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    friend_ids = get_accepted_friend_ids(current_user.user_id, session)

    if not friend_ids:
        return []

    song = session.exec(
        select(Song)
        .where(Song.song_id == song_id)
        .options(
            selectinload(Song.reviews)
            .selectinload(Review.user)
            .selectinload(User.profile)
        )
    ).first()

    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    friend_reviews = [
        review
        for review in song.reviews
        if review.user_id is not None and review.user_id in friend_ids
    ]

    out: list[FriendReviewOut] = []
    for review in sorted(friend_reviews, key=lambda r: r.review_id or 0, reverse=True):
        if review.user is None:
            continue

        profile = review.user.profile

        out.append(
            FriendReviewOut(
                reviewId=review.review_id,
                review=review.review,
                reviewRating=review.review_rating,
                reviewRatingCount=review.review_rating_count,
                userId=review.user.user_id,
                username=review.user.username,
                firstName=profile.first_name if profile else None,
                lastName=profile.last_name if profile else None,
                avatar=profile.avatar if profile else None,
                kind="song",
                title=song.song_name,
                cover=song.cover,
                movieId=None,
                songId=song.song_id,
            )
        )

    return out
