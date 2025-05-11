from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship
from db import Base

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

    restaurant = relationship("Restaurant", back_populates="orders")
    order_meals = relationship("OrderMeal", back_populates="order", cascade="all, delete-orphan")
