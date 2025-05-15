from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from db import get_db
from models import Restaurant, RestaurantMeal, Favorite, Order, OrderMeal
from schemas.restaurant import RestaurantDetailResponse, MealResponse
from schemas.order import OrderCreate
import datetime
from typing import List, Optional


router = APIRouter()

@router.get("/restaurants/search", response_model=List[RestaurantDetailResponse])
def search_restaurants(
    q: Optional[str] = Query(None, description="Buscar por nombre del restaurante"),
    type: Optional[str] = Query(None, description="Buscar por tipo de comida"),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)

    if q:
        query = query.filter(Restaurant.name.ilike(f"%{q}%"))
    if type:
        query = query.filter(Restaurant.type.ilike(f"%{type}%"))

    restaurants = query.all()

    result = []
    for r in restaurants:
        orders_count = len(r.orders)
        is_favorite = db.query(Favorite).filter(Favorite.restaurantID == r.id).first() is not None
        meals = db.query(RestaurantMeal).filter(RestaurantMeal.restaurantID == r.id).all()
        meals_response = [
            MealResponse(
                id=m.id,
                name=m.name,
                price=m.price,
                thumbnailPath=m.thumbnailPath
            ) for m in meals
        ]

        result.append(RestaurantDetailResponse(
            id=r.id,
            name=r.name,
            type=r.type,
            creationDate=r.creationDate,
            thumbnailPath=r.thumbnailPath,
            ordersCount=orders_count,
            isFavorite=is_favorite,
            meals=meals_response
        ))

    return result

@router.get("/restaurants", response_model=List[RestaurantDetailResponse])
def get_all_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).order_by(Restaurant.creationDate.desc()).all()
    result = []

    for r in restaurants:
        orders_count = len(r.orders)
        is_favorite = db.query(Favorite).filter(Favorite.restaurantID == r.id).first() is not None
        meals = db.query(RestaurantMeal).filter(RestaurantMeal.restaurantID == r.id).all()
        meals_response = [
            MealResponse(
                id=m.id,
                name=m.name,
                price=m.price,
                thumbnailPath=m.thumbnailPath
            ) for m in meals
        ]

        result.append(RestaurantDetailResponse(
            id=r.id,
            name=r.name,
            type=r.type,
            creationDate=r.creationDate,
            thumbnailPath=r.thumbnailPath,
            ordersCount=orders_count,
            isFavorite=is_favorite,
            meals=meals_response
        ))

    return result

@router.get("/restaurants/favorites-recent", response_model=List[RestaurantDetailResponse])
def get_recent_favorites(db: Session = Depends(get_db)):
    favorites = (
        db.query(Restaurant)
        .join(Favorite, Restaurant.id == Favorite.restaurantID)
        .order_by(Favorite.favoriteDate.desc())
        .limit(10)
        .all()
    )

    result = []
    for r in favorites:
        orders_count = len(r.orders)
        is_favorite = True  # Garantizado por el join
        meals = db.query(RestaurantMeal).filter(RestaurantMeal.restaurantID == r.id).all()
        meals_response = [
            MealResponse(
                id=m.id,
                name=m.name,
                price=m.price,
                thumbnailPath=m.thumbnailPath
            ) for m in meals
        ]

        result.append(RestaurantDetailResponse(
            id=r.id,
            name=r.name,
            type=r.type,
            creationDate=r.creationDate,
            thumbnailPath=r.thumbnailPath,
            ordersCount=orders_count,
            isFavorite=is_favorite,
            meals=meals_response
        ))

    return result


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


@router.post("/restaurants/{id}/orders")
def create_order(id: int, order_data: OrderCreate, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    # Validar que los meals existan y correspondan al restaurante
    for item in order_data.meals:
        meal = db.query(RestaurantMeal).filter_by(id=item.mealID, restaurantID=id).first()
        if not meal:
            raise HTTPException(status_code=400, detail=f"Comida ID {item.mealID} no válida para este restaurante")

    # Crear orden
    new_order = Order(
        restaurantID=id,
        creationDate=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        subtotal=order_data.subtotal,
        tax=order_data.tax,
        shippingCost=order_data.shippingCost,
        serviceCost=order_data.serviceCost,
        total=order_data.total
    )
    db.add(new_order)
    db.commit()  # Para obtener new_order.id
    db.refresh(new_order)

    # Insertar comidas del pedido
    for item in order_data.meals:
        db.add(OrderMeal(
            orderID=new_order.id,
            mealID=item.mealID,
            amount=item.amount
        ))

    db.commit()
    return {"message": "Pedido creado exitosamente", "order_id": new_order.id}

@router.get("/restaurants/{id}/meals", response_model=List[MealResponse])
def get_meals_by_restaurant(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter_by(id=id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

    meals = db.query(RestaurantMeal).filter_by(restaurantID=id).all()
    return meals
