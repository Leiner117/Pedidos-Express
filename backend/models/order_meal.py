from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class OrderMeal(Base):
    __tablename__ = "OrderMeals"

    id = Column(Integer, primary_key=True, index=True)
    orderID = Column(Integer, ForeignKey("Orders.id"), nullable=False)
    mealID = Column(Integer, ForeignKey("RestaurantMeals.id"), nullable=False)
    amount = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="order_meals")
    meal = relationship("RestaurantMeal", back_populates="order_meals")
