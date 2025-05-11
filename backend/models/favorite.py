from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from db import Base

class Favorite(Base):
    __tablename__ = "Favorite"

    id = Column(Integer, primary_key=True, index=True)
    restaurantID = Column(Integer, ForeignKey("Restaurants.id"), nullable=False)
    favoriteDate = Column(String, nullable=False)

    restaurant = relationship("Restaurant", back_populates="favorites")
