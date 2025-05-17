from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from db import Base

class Restaurant(Base):
    __tablename__ = "Restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    creationDate = Column(String, nullable=False)
    type = Column(String)
    imagePath = Column(Text)
    thumbnailPath = Column(Text, nullable=True)
    meals = relationship("RestaurantMeal", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")
