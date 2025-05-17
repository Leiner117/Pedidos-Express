from sqlalchemy import Column, Integer, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from db import Base

class RestaurantMeal(Base):
    __tablename__ = "RestaurantMeals"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("Restaurants.id"), nullable=False)
    name = Column(String, nullable=False)
    imagePath = Column(Text)
    thumbnailPath = Column(Text,nullable=True)
    price = Column(Float, nullable=False)

    restaurant = relationship("Restaurant", back_populates="meals")
    order_meals = relationship("OrderMeal", back_populates="meal", cascade="all, delete-orphan")
