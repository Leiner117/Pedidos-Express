import sys
import os
import datetime

# Agregar la raíz al path para poder importar los módulos correctamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SessionLocal, engine, Base
from models import RestaurantMeal

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

# Crear una sesión
db = SessionLocal()

# ID del restaurante al que le asignarás comidas (ya debe existir)
RESTAURANT_ID = 1

# Comidas de ejemplo
meals = [
    {
        "name": "Casado con Pollo",
        "price": 3500.0,
        "thumbnailPath": "thumbnails/foods/casado_pollo.jpg"
    },
    {
        "name": "Arroz con camarones",
        "price": 4500.0,
        "thumbnailPath": "thumbnails/foods/arroz_camarones.jpg"
    },
    {
        "name": "Sopa Negra",
        "price": 2500.0,
        "thumbnailPath": "thumbnails/foods/sopa_negra.jpg"
    },
]

# Insertar comidas
for m in meals:
    new_meal = RestaurantMeal(
        restaurantID=RESTAURANT_ID,
        name=m["name"],
        price=m["price"],
        thumbnailPath=m["thumbnailPath"]
    )
    db.add(new_meal)

# Guardar en la base de datos
db.commit()
db.close()

print(f"✅ Se insertaron {len(meals)} comidas para el restaurante con ID {RESTAURANT_ID}.")
