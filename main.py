from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from model.database import create_db_and_tables
from router import Authentication, MovieRouter, SongRouter, Reviews
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

app.include_router(Reviews.router)