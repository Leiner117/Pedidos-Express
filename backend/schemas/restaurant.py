from pydantic import BaseModel
from typing import List

class MealResponse(BaseModel):
    id: int
    name: str
    thumbnailPath: str
    price: float

    class Config:
        orm_mode = True

class RestaurantDetailResponse(BaseModel):
    id: int
    name: str
    type: str
    creationDate: str
    thumbnailPath: str
    ordersCount: int
    isFavorite: bool
    meals: List[MealResponse]

    class Config:
        orm_mode = True
