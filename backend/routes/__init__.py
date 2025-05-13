from fastapi import APIRouter
from routes import orders, restaurants

router = APIRouter()

router.include_router(orders.router, prefix="/orders", tags=["orders"])
router.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])

