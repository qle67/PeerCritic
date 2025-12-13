# Create admin
import os

from dotenv import load_dotenv
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette_admin.auth import AuthProvider, AdminConfig, AdminUser
from starlette_admin.contrib.sqlmodel import Admin, ModelView
from starlette_admin.exceptions import FormValidationError, LoginFailed

from model.Actor import Actor
from model.Artist import Artist
from model.Director import Director
from model.Episode import Episode
from model.Genre import Genre
from model.Movie import Movie
from model.Profile import Profile
from model.Review import Review
from model.Song import Song
from model.SongArtist import SongArtist
from model.User import User
from model.Writer import Writer
from model.database import engine

# Get secret passwords from environment
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

users = {
    "admin": {
        "name": "Admin",
        "roles": ["read", "create", "edit", "delete", "action_make_published"],
    },
    "viewer": {"name": "Viewer", "avatar": "guest.png", "roles": ["read"]},
}

class UsernameAndPasswordProvider(AuthProvider):
    """
    This is only for demo purpose, it's not a better
    way to save and validate user credentials
    """

    async def login(
            self,
            username: str,
            password: str,
            remember_me: bool,
            request: Request,
            response: Response,
    ) -> Response:
        if len(username) < 3:
            """Form data validation"""
            raise FormValidationError(
                {"username": "Ensure username has at least 03 characters"}
            )

        if username in users and password == ADMIN_PASSWORD:
            """Save `username` in session"""
            request.session.update({"username": username})
            return response

        raise LoginFailed("Invalid username or password")

    async def is_authenticated(self, request) -> bool:
        if request.session.get("username", None) in users:
            """
            Save current `user` object in the request state. Can be used later
            to restrict access to connected user.
            """
            request.state.user = users.get(request.session["username"])
            return True

        return False

    def get_admin_config(self, request: Request) -> AdminConfig:
        user = request.state.user  # Retrieve current user
        # Update app title according to current_user
        custom_app_title = "Hello, " + user["name"] + "!"
        return AdminConfig(
            app_title=custom_app_title,
        )

    def get_admin_user(self, request: Request) -> AdminUser:
        user = request.state.user  # Retrieve current user
        return AdminUser(username=user["name"])

    async def logout(self, request: Request, response: Response) -> Response:
        request.session.clear()
        return response

admin = Admin(engine, 
              title="PeerCritic",
              base_url="/admin",
              auth_provider=UsernameAndPasswordProvider(),
              middlewares=[Middleware(SessionMiddleware, secret_key=SECRET_KEY)],
              )

# Add view
admin.add_view(ModelView(User))
admin.add_view(ModelView(Profile))
admin.add_view(ModelView(Artist))
admin.add_view(ModelView(Song))
admin.add_view(ModelView(Director))
admin.add_view(ModelView(Writer))
admin.add_view(ModelView(Actor))
admin.add_view(ModelView(Genre))
admin.add_view(ModelView(Episode))
admin.add_view(ModelView(Movie))
admin.add_view(ModelView(Review))


