import os
from PIL import Image
from fastapi import UploadFile
import shutil

def create_thumbnail(source_path: str, destination_path: str, size=(800, 800)) -> None:
    """Create a thumbnail while maintaining original quality."""
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    with Image.open(source_path) as img:
        # Mantener el aspect ratio
        img.thumbnail(size)
        # Guardar con la misma calidad
        img.save(destination_path, "JPEG")

def process_restaurant_image(file: UploadFile, restaurant_id: int) -> str:
    """Process restaurant image and return path for thumbnail."""
    thumbnails_dir = "thumbnails/restaurants"
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"restaurant_{restaurant_id}{ext}"
    temp_path = f"temp_{filename}"

    # Guarda el archivo temporalmente
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    thumbnail_path = os.path.join(thumbnails_dir, filename)
    create_thumbnail(temp_path, thumbnail_path)

    # Elimina el archivo temporal
    os.remove(temp_path)

    return thumbnail_path

def process_meal_image(file: UploadFile, restaurant_id: int, meal_id: int) -> str:
    thumbnails_dir = "thumbnails/meals"
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"meal_{restaurant_id}_{meal_id}{ext}"
    temp_path = f"temp_{filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    thumbnail_path = os.path.join(thumbnails_dir, filename)
    create_thumbnail(temp_path, thumbnail_path)

    os.remove(temp_path)

    return thumbnail_path