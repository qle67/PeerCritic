from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from model.database import create_db_and_tables
from router import Authentication, MovieRouter, ReviewsRouter, SongRouter, WriterRouter, ActorRouter, DirectorRouter, \
    GenreRouter, FriendsRouter, UsersRouter
from router import Authentication, MovieRouter, SongRouter, Reviews, WriterRouter, ActorRouter, DirectorRouter, \
    GenreRouter, FriendsRouter
from router.Admin import admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

origins = ["http://localhost:5173", "http://localhost:3000", "http://169.254.244.127:3000"]

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

# Register Writer routes
app.include_router(WriterRouter.router)

# Register Actor routes
app.include_router(ActorRouter.router)

# Register Director routes
app.include_router(DirectorRouter.router)

# Register Genre routes
app.include_router(GenreRouter.router)

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