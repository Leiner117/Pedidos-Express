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

def process_restaurant_image(file: UploadFile, restaurant_id: int) -> tuple[str, str]:
    """Process restaurant image and return paths for original and thumbnail."""
    # Define paths
    #uploads_dir = "uploads/restaurants"
    thumbnails_dir = "thumbnails/restaurants"
    
    # Generate filenames
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"restaurant_{restaurant_id}{ext}"
    
    # Define full paths
    #original_path = os.path.join(uploads_dir, filename)
    thumbnail_path = os.path.join(thumbnails_dir, filename)
    # Create thumbnail
    create_thumbnail(thumbnail_path)
    
    return thumbnail_path

def process_meal_image(file: UploadFile, restaurant_id: int, meal_id: int) -> tuple[str, str]:
    """Process meal image and return paths for original and thumbnail."""
    # Define paths
    thumbnails_dir = "thumbnails/meals"
    
    # Generate filenames
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"meal_{restaurant_id}_{meal_id}{ext}"
    
    # Define full paths
    thumbnail_path = os.path.join(thumbnails_dir, filename)
    create_thumbnail(thumbnail_path)
    
    return thumbnail_path 