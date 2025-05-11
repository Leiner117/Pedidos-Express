import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///pedidos.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Crea la sesión de la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependencia para obtener sesión en las rutas

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()