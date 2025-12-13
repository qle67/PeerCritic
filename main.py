from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from model.database import create_db_and_tables
from router import Authentication
from router.Admin import admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

origins = ["http://localhost:5173",]

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],)

# Mount admin to your app
admin.mount_to(app)
 
app.include_router(Authentication.router)