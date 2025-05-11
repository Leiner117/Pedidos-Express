import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes import router as api_router


app = FastAPI()

# Incluir todas las rutas de la API
app.include_router(api_router)

# Middleware CORS (ajustar en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes (inseguro en prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta raíz para prueba
@app.get("/")
async def root():
    return {"message": "API FUNCIONANDO"}