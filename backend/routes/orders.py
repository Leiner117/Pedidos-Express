from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import Restaurant, OrderMeal, Order, RestaurantMeal
from schemas.order import OrderResponse, OrderMealResponse

router = APIRouter()

@router.get("/restaurants/{id}/orders", response_model=list[OrderResponse])
def get_restaurant_orders(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    orders = db.query(Order).filter(Order.restaurantID == id).order_by(Order.creationDate.desc()).all()
    
    result = []
    for order in orders:
        meals_data = []
        for om in order.order_meals:
            meal = db.query(RestaurantMeal).filter(RestaurantMeal.id == om.mealID).first()
            if meal:
                meals_data.append(OrderMealResponse(
                    name=meal.name,
                    thumbnailPath=meal.thumbnailPath,
                    price=meal.price,
                    amount=om.amount
                ))
        result.append(OrderResponse(
            creationDate=order.creationDate,
            subtotal=order.subtotal,
            tax=order.tax,
            shippingCost=order.shippingCost,
            serviceCost=order.serviceCost,
            total=order.total,
            meals=meals_data
        ))

    return result
