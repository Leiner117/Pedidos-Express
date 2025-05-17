from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

class MealCreate(BaseModel):
    name: str = Field(..., max_length=150)
    price: float = Field(..., gt=0)
    image: Optional[str] = None  # Optional image filename

class RestaurantCreate(BaseModel):
    name: str = Field(..., max_length=150)
    type: str
    image: Optional[str] = None  # Optional image filename
    meals: List[MealCreate]

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
