from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Conexión a SQLite (puedes cambiar el path si quieres usar otro archivo)
DATABASE_URL = "sqlite:///pedidos.db"

engine = create_engine(DATABASE_URL, echo=True)

# Crear clase base para los modelos
Base = declarative_base()

# Crear el factory de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
