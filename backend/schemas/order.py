from pydantic import BaseModel
from typing import List


class OrderMealInput(BaseModel):
    mealID: int
    amount: int

class OrderCreate(BaseModel):
    subtotal: float
    tax: float
    shippingCost: float
    serviceCost: float
    total: float
    meals: List[OrderMealInput]

class OrderMealResponse(BaseModel):
    name: str
    thumbnailPath: str
    price: float
    amount: int

    class Config:
        orm_mode = True


class OrderResponse(BaseModel):
    creationDate: str
    subtotal: float
    tax: float
    shippingCost: float
    serviceCost: float
    total: float
    meals: List[OrderMealResponse]

    class Config:
        orm_mode = True
