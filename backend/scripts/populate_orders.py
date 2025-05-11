import sys
import os
import datetime

# Asegurar ruta base
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SessionLocal, engine, Base
from models import Order, OrderMeal, RestaurantMeal

Base.metadata.create_all(bind=engine)
db = SessionLocal()

RESTAURANT_ID = 1

# Obtener comidas existentes
meals = db.query(RestaurantMeal).filter_by(restaurantID=RESTAURANT_ID).all()
if not meals:
    print("⚠️ No hay comidas asociadas al restaurante. Agrega comidas primero.")
    db.close()
    exit()

# Crear una orden con 2 comidas al azar
selected_meals = meals[:2]  # Tomamos las 2 primeras
amounts = [2, 1]  # Por ejemplo: 2 de la primera, 1 de la segunda

# Calcular subtotal
subtotal = sum(m.price * amt for m, amt in zip(selected_meals, amounts))
tax = round(subtotal * 0.13, 2)
shipping = round(subtotal * 0.10, 2)
service = round((subtotal + shipping) * 0.10, 2)
total = round(subtotal + tax + shipping + service, 2)

# Crear la orden
order = Order(
    restaurantID=RESTAURANT_ID,
    creationDate=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    subtotal=subtotal,
    tax=tax,
    shippingCost=shipping,
    serviceCost=service,
    total=total
)
db.add(order)
db.commit()  # Guardar para obtener el ID

# Crear entradas en OrderMeal
for meal, amt in zip(selected_meals, amounts):
    om = OrderMeal(
        orderID=order.id,
        mealID=meal.id,
        amount=amt
    )
    db.add(om)

print(f"✅ Se creó una orden (ID: {order.id}) con {len(selected_meals)} comidas.")

db.commit()
db.close()


