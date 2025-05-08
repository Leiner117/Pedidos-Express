
from db import Base, engine
from models import Restaurant, Favorite, RestaurantMeal, Order, OrderMeal

Base.metadata.create_all(bind=engine)
