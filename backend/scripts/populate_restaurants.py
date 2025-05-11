from db import SessionLocal, engine, Base
from models import Restaurant
import datetime

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Sesión de base de datos
db = SessionLocal()

# Lista de restaurantes de ejemplo
sample_restaurants = [
    {
        "name": "Soda El Tico",
        "type": "Comida Típica",
        "thumbnailPath": "thumbnails/restaurants/soda_el_tico.jpg"
    },
    {
        "name": "Pizzas Express",
        "type": "Comida Italiana",
        "thumbnailPath": "thumbnails/restaurants/pizzas_express.jpg"
    },
    {
        "name": "Tacos Locos",
        "type": "Comida Mexicana",
        "thumbnailPath": "thumbnails/restaurants/tacos_locos.jpg"
    },
    {
        "name": "Asia Gourmet",
        "type": "Comida Asiática",
        "thumbnailPath": "thumbnails/restaurants/asia_gourmet.jpg"
    },
    {
        "name": "Deli Postres",
        "type": "Postres y Repostería",
        "thumbnailPath": "thumbnails/restaurants/deli_postres.jpg"
    },
]

# Insertar restaurantes
for r in sample_restaurants:
    new_restaurant = Restaurant(
        name=r["name"],
        type=r["type"],
        thumbnailPath=r["thumbnailPath"],
        creationDate=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_restaurant)

# Guardar cambios
db.commit()
db.close()

print("Se han insertado restaurantes de ejemplo.")
