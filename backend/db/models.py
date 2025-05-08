from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from db import Base

class Restaurant(Base):
    __tablename__ = "Restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    creationDate = Column(String, nullable=False)
    type = Column(String)
    thumbnailPath = Column(Text)

    # Relaciones
    meals = relationship("RestaurantMeal", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "Favorite"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("Restaurants.id"), nullable=False)
    favoriteDate = Column(String, nullable=False)

    # Relaciones
    restaurant = relationship("Restaurant", back_populates="favorites")


class RestaurantMeal(Base):
    __tablename__ = "RestaurantMeals"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("Restaurants.id"), nullable=False)
    name = Column(String, nullable=False)
    thumbnailPath = Column(Text)
    price = Column(Float, nullable=False)

    # Relaciones
    restaurant = relationship("Restaurant", back_populates="meals")
    order_meals = relationship("OrderMeal", back_populates="meal", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "Orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("Restaurants.id"), nullable=False)
    creationDate = Column(String, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    shippingCost = Column(Float, nullable=False)
    serviceCost = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    # Relaciones
    restaurant = relationship("Restaurant", back_populates="orders")
    order_meals = relationship("OrderMeal", back_populates="order", cascade="all, delete-orphan")


class OrderMeal(Base):
    __tablename__ = "OrderMeals"

    id = Column(Integer, primary_key=True, index=True)
    orderID = Column(Integer, ForeignKey("Orders.id"), nullable=False)
    mealID = Column(Integer, ForeignKey("RestaurantMeals.id"), nullable=False)
    amount = Column(Integer, nullable=False)

    # Relaciones
    order = relationship("Order", back_populates="order_meals")
    meal = relationship("RestaurantMeal", back_populates="order_meals")
