from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import Restaurant, RestaurantMeal, Favorite
from schemas.restaurant import RestaurantDetailResponse, MealResponse

router = APIRouter()

@router.get("/restaurants/{id}", response_model=RestaurantDetailResponse)
def get_restaurant_details(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    # Conteo de órdenes
    orders_count = len(restaurant.orders)

    # ¿Es favorito? (simplemente si tiene una entrada en Favorite)
    is_favorite = db.query(Favorite).filter(Favorite.restaurantID == id).first() is not None

    # Lista de comidas
    meals = db.query(RestaurantMeal).filter(RestaurantMeal.restaurantID == id).all()
    meals_response = [
        MealResponse(
            id=meal.id,
            name=meal.name,
            price=meal.price,
            thumbnailPath=meal.thumbnailPath
        ) for meal in meals
    ]

    return RestaurantDetailResponse(
        id=restaurant.id,
        name=restaurant.name,
        type=restaurant.type,
        creationDate=restaurant.creationDate,
        thumbnailPath=restaurant.thumbnailPath,
        ordersCount=orders_count,
        isFavorite=is_favorite,
        meals=meals_response
    )
