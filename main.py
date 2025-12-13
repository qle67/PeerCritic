from contextlib import asynccontextmanager

from fastapi import FastAPI

from model.database import create_db_and_tables
from router import Authentication
from router.Admin import admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Mount admin to your app
admin.mount_to(app)
 
app.include_router(Authentication.router)