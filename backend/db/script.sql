-- Tabla de Restaurantes
CREATE TABLE Restaurants (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    creationDate TEXT NOT NULL,
    type TEXT,
    thumbnailPath TEXT
);

-- Tabla de Favoritos
CREATE TABLE Favorite (
    id INTEGER PRIMARY KEY,
    restaurantID INTEGER NOT NULL,
    favoriteDate TEXT NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES Restaurants(id)
);

-- Tabla de Comidas de Restaurantes
CREATE TABLE RestaurantMeals (
    id INTEGER PRIMARY KEY,
    restaurantID INTEGER NOT NULL,
    name TEXT NOT NULL,
    thumbnailPath TEXT,
    price REAL NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES Restaurants(id)
);

-- Tabla de Órdenes
CREATE TABLE Orders (
    id INTEGER PRIMARY KEY,
    restaurantID INTEGER NOT NULL,
    creationDate TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    shippingCost REAL NOT NULL,
    serviceCost REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES Restaurants(id)
);

-- Tabla de Comidas Ordenadas
CREATE TABLE OrderMeals (
    id INTEGER PRIMARY KEY,
    orderID INTEGER NOT NULL,
    mealID INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (orderID) REFERENCES Orders(id),
    FOREIGN KEY (mealID) REFERENCES RestaurantMeals(id)
);
