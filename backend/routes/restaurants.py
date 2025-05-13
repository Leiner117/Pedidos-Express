from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from models import Restaurant, RestaurantMeal, Favorite, Order
from schemas.restaurant import RestaurantDetailResponse, MealResponse
import datetime

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


@router.put("/restaurants/{id}/increment-orders", response_model=RestaurantDetailResponse)
def increment_order_count(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    # Crear orden con valores en cero
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_order = Order(
        restaurantID=id,
        creationDate=now,
        subtotal=0.0,
        tax=0.0,
        shippingCost=0.0,
        serviceCost=0.0,
        total=0.0
    )
    db.add(new_order)
    db.commit()

    # Preparar respuesta actualizada
    orders_count = len(restaurant.orders)
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "type": restaurant.type,
        "creationDate": restaurant.creationDate,
        "thumbnailPath": restaurant.thumbnailPath,
        "ordersCount": orders_count,
        "isFavorite": db.query(Favorite).filter_by(restaurantID=id).first() is not None,
        "meals": [
            {
                "id": m.id,
                "name": m.name,
                "price": m.price,
                "thumbnailPath": m.thumbnailPath
            } for m in restaurant.meals
        ]
    }

@router.put("/restaurants/{id}/favorite")
def add_favorite(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    # Verificar si ya está en favoritos
    favorite_exists = db.query(Favorite).filter(Favorite.restaurantID == id).first()
    if favorite_exists:
        raise HTTPException(status_code=400, detail="El restaurante ya está en favoritos")

    # Registrar favorito con timestamp actual
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_favorite = Favorite(
        restaurantID=id,
        favoriteDate=now
    )
    db.add(new_favorite)
    db.commit()

    return {"message": "Restaurante agregado a favoritos correctamente."}


@router.delete("/restaurants/{id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    favorite = db.query(Favorite).filter(Favorite.restaurantID == id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="El restaurante no está en favoritos")

    db.delete(favorite)
    db.commit()
    return  # 204 No Content: no se retorna body
