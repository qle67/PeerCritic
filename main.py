from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from model.database import create_db_and_tables
from router import (
    Authentication,
    MovieRouter,
    ReviewsRouter,
    SongRouter,
    ArtistRouter,
    WriterRouter,
    ActorRouter,
    DirectorRouter,
    GenreRouter,
    FriendsRouter,
    UsersRouter,
    MessagesRouter,
    #WsMessagesRouter,
)
from router.Admin import admin


# Application lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()      # Creates all SQLModel tables if they don't exist
    yield

# CORS configuration
origins = ["http://localhost:3000", "http://169.254.244.127:3000"]

# Create FastAPI application instance
app = FastAPI(lifespan=lifespan)


# Add CORS Middleware
app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],)

# Mount admin to your app
admin.mount_to(app)

# Register Authentication routes 
app.include_router(Authentication.router)

# Register Movie routes
app.include_router(MovieRouter.router)

# Register Song routes
app.include_router(SongRouter.router)

# Register Review routes
app.include_router(ReviewsRouter.router)

# Register Friends routes
app.include_router(FriendsRouter.router)

#Register Messages routes
app.include_router(MessagesRouter.router)

#Register Messages websocket router
#app.include_router(WsMessagesRouter.router)

# Register Writer routes
app.include_router(WriterRouter.router)

# Register Actor routes
app.include_router(ActorRouter.router)

# Register Director routes
app.include_router(DirectorRouter.router)

# Register Genre routes
app.include_router(GenreRouter.router)

# Register Artist routes
app.include_router(ArtistRouter.router)

#Register Users routes
app.include_router(UsersRouter.router)

# Register Writer routes
app.include_router(WriterRouter.router)

# Register Actor routes
app.include_router(ActorRouter.router)

# Register Director routes
app.include_router(DirectorRouter.router)

# Register Genre routes
app.include_router(GenreRouter.router)