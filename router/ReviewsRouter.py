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

# Define API router for review-related endpoints under /my
router = APIRouter(prefix="/my", tags=["reviews"])


# Define response model for current user's reviews
class MyReviewOut(BaseModel):
    reviewId: int
    review: Optional[str]
    reviewRating: float
    reviewRatingCount: Optional[int]
    kind: Literal["movie", "song", "tv"]
    title: str
    cover: Optional[str] = None
    movieId: Optional[int] = None
    songId: Optional[int] = None


# Define response model for friend reviews
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


# Define response model for all reviews on a media item
class MediaReviewOut(BaseModel):
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


# Define request model for creating or updating a review
class ReviewCreateIn(BaseModel):
    review: Optional[str] = None
    reviewRating: float


# Define response model for created or updated review
class ReviewOut(BaseModel):
    reviewId: int
    review: Optional[str]
    reviewRating: float
    reviewRatingCount: Optional[int]
    movieId: Optional[int] = None
    songId: Optional[int] = None


# Helper function to get all accepted friend ids for the current user
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


# Get all reviews written by the current user
@router.get("/reviews", response_model=list[MyReviewOut])
async def get_my_reviews(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    stmt = (
        select(Review)
        .where(Review.user_id == current_user.user_id)
        .options(
            selectinload(Review.movie).selectinload(Movie.episodes),
            selectinload(Review.song),
        )
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
                    kind="tv" if r.movie.episodes else "movie",
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


# Get accepted friends' reviews for a movie
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

    # Filter only reviews written by accepted friends
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


# Get accepted friends' reviews for a song
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

    # Filter only reviews written by accepted friends
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


# Get all public reviews for a movie
@router.get("/media/reviews/movie/{movie_id}", response_model=list[MediaReviewOut])
async def get_media_reviews_for_movie(
    movie_id: int,
    session: SessionDep,
):
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

    out: list[MediaReviewOut] = []
    for review in sorted(movie.reviews, key=lambda r: r.review_id or 0, reverse=True):
        if review.user is None:
            continue

        profile = review.user.profile

        out.append(
            MediaReviewOut(
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


# Get all public reviews for a song
@router.get("/media/reviews/song/{song_id}", response_model=list[MediaReviewOut])
async def get_media_reviews_for_song(
    song_id: int,
    session: SessionDep,
):
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

    out: list[MediaReviewOut] = []
    for review in sorted(song.reviews, key=lambda r: r.review_id or 0, reverse=True):
        if review.user is None:
            continue

        profile = review.user.profile

        out.append(
            MediaReviewOut(
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


# Create a new review or update an existing review for a movie
@router.post("/reviews/movie/{movie_id}", response_model=ReviewOut)
async def create_or_update_movie_review(
    movie_id: int,
    payload: ReviewCreateIn,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    movie = session.exec(
        select(Movie).where(Movie.movie_id == movie_id)
    ).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Check if the current user already reviewed this movie
    existing_review = session.exec(
        select(Review).where(
            Review.user_id == current_user.user_id,
            Review.movie_id == movie_id,
        )
    ).first()

    if existing_review:
        existing_review.review = payload.review
        existing_review.review_rating = payload.reviewRating
        session.add(existing_review)
        session.commit()
        session.refresh(existing_review)

        return ReviewOut(
            reviewId=existing_review.review_id,
            review=existing_review.review,
            reviewRating=existing_review.review_rating,
            reviewRatingCount=existing_review.review_rating_count,
            movieId=existing_review.movie_id,
            songId=None,
        )

    # Create a new movie review when none exists yet
    new_review = Review(
        review=payload.review,
        review_rating=payload.reviewRating,
        review_rating_count=movie.movie_rating_count,
        user_id=current_user.user_id,
        movie_id=movie_id,
        song_id=None,
    )

    session.add(new_review)
    session.commit()
    session.refresh(new_review)

    return ReviewOut(
        reviewId=new_review.review_id,
        review=new_review.review,
        reviewRating=new_review.review_rating,
        reviewRatingCount=new_review.review_rating_count,
        movieId=new_review.movie_id,
        songId=None,
    )


# Create a new review or update an existing review for a song
@router.post("/reviews/song/{song_id}", response_model=ReviewOut)
async def create_or_update_song_review(
    song_id: int,
    payload: ReviewCreateIn,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    song = session.exec(
        select(Song).where(Song.song_id == song_id)
    ).first()

    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Check if the current user already reviewed this song
    existing_review = session.exec(
        select(Review).where(
            Review.user_id == current_user.user_id,
            Review.song_id == song_id,
        )
    ).first()

    if existing_review:
        existing_review.review = payload.review
        existing_review.review_rating = payload.reviewRating
        session.add(existing_review)
        session.commit()
        session.refresh(existing_review)

        return ReviewOut(
            reviewId=existing_review.review_id,
            review=existing_review.review,
            reviewRating=existing_review.review_rating,
            reviewRatingCount=existing_review.review_rating_count,
            movieId=None,
            songId=existing_review.song_id,
        )

    # Create a new song review when none exists yet
    new_review = Review(
        review=payload.review,
        review_rating=payload.reviewRating,
        review_rating_count=song.song_rating_count,
        user_id=current_user.user_id,
        movie_id=None,
        song_id=song_id,
    )

    session.add(new_review)
    session.commit()
    session.refresh(new_review)

    return ReviewOut(
        reviewId=new_review.review_id,
        review=new_review.review,
        reviewRating=new_review.review_rating,
        reviewRatingCount=new_review.review_rating_count,
        movieId=None,
        songId=new_review.song_id,
    )

@router.delete("/reviews/{review_id}")
async def delete_my_review(
    review_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    review = session.exec(
        select(Review).where(
            Review.review_id == review_id,
            Review.user_id == current_user.user_id,
        )
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    session.delete(review)
    session.commit()

    return {"message": "Review deleted"}