from fastapi import APIRouter
from routes import orders

router = APIRouter()

router.include_router(orders.router, prefix="/orders", tags=["orders"])
