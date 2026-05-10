from fastapi import APIRouter

from app.api.endpoints.health import router as health_router
from app.api.endpoints.users import router as users_router
from app.api.endpoints.profiles import router as profiles_router
from app.api.endpoints.interests import router as interests_router
from app.api.endpoints.discover import router as discover_router
from app.api.endpoints.reactions import router as reactions_router
from app.api.endpoints.matches import router as matches_router
from app.api.endpoints.messages import router as messages_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(users_router)
api_router.include_router(profiles_router)
api_router.include_router(interests_router)
api_router.include_router(discover_router)
api_router.include_router(reactions_router)
api_router.include_router(matches_router)
api_router.include_router(messages_router)