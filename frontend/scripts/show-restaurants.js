const API_URL = "http://localhost:8000/restaurants/restaurants";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const container = document.getElementById("restaurant");

// Verifica si el ID está presente en la URL
if (!id) {
    container.innerHTML = "<p>No se encontró el restaurante.</p>";
} else {
    // Realiza la solicitud a la API para obtener los detalles del restaurante
    // y muestra la información en el contenedor
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = `
            <div class="bg-white p-6 rounded shadow">
            <img src="/backend/${data.thumbnailPath}" alt="${data.name}" class="w-full h-64 object-cover rounded">
            <h1 class="text-2xl font-bold mt-4">${data.name}</h1>
            <p class="text-gray-600">Tipo: ${data.type}</p>
            <p class="text-sm">Creado: ${data.creationDate}</p>
            <p class="text-sm mb-4">Pedidos: ${data.ordersCount}</p>
            <button id="fav-btn" class="bg-blue-500 text-white px-4 py-2 rounded mb-4"></button>
            <button id="order-history-btn" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition mb-4 ml-2">
                Ver historial de pedidos
            </button>

            <h2 class="text-xl font-semibold mt-6 mb-2">Comidas</h2>
            <div class="grid grid-cols-2 gap-4">
                ${data.meals.map(meal => `
                <div 
                class="bg-white rounded-xl shadow hover:shadow-md transition p-4 flex flex-col items-center text-center"
                data-name="${meal.name}"
                data-price="${meal.price}"
                data-img="/backend/${meal.thumbnailPath}"
                data-mealid="${meal.id}"
                draggable="true"
                onclick="showMealModal(this)"
                >
                <img src="/backend/${meal.thumbnailPath}" alt="${meal.name}" class="w-28 h-28 object-cover rounded-full shadow-sm mb-3">
                <h3 class="text-lg font-semibold text-gray-800">${meal.name}</h3>
                <p class="text-blue-600 font-medium mt-1">₡${meal.price}</p>
                <button 
                    data-mealid="${meal.id}" 
                    data-name="${meal.name}" 
                    data-price="${meal.price}" 
                    class="mt-3 bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
                >
                    Añadir al carrito
                </button>
</div>
                `).join("")}
            </div>
            </div>
            `;
            document.querySelectorAll("[draggable='true']").forEach(card => {
            card.addEventListener("dragstart", (e) => {
                const mealID = card.dataset.mealid;
                const name = card.dataset.name;
                const price = card.dataset.price;

                // Pasamos los datos como string JSON
                e.dataTransfer.setData("application/json", JSON.stringify({ mealID, name, price }));
            });
            });

            // Lógica de favoritos con API
            const favBtn = document.getElementById("fav-btn");
            let isFav = data.isFavorite === true; // o false si no existe

            const updateButtonText = () => {
                favBtn.textContent = isFav ? "Quitar de favoritos" : "Agregar a favoritos";
            };

            updateButtonText();

            favBtn.onclick = () => {
                const method = isFav ? "DELETE" : "PUT";
                fetch(`${API_URL}/${id}/favorite`, {
                    method,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(res => {
                        if (res.ok) {
                            isFav = !isFav;
                            updateButtonText();
                        } else {
                            throw new Error("Error al actualizar favoritos");
                        }
                    })
                    .catch(err => {
                        console.error("Error con favoritos:", err);
                        alert("No se pudo actualizar el estado de favoritos.");
                    });
            };

            // Lógica para mostrar el historial de pedidos
            // Modal de pedidos
            const orderModal = document.getElementById("order-modal");
            const ordersContent = document.getElementById("orders-content");
            const closeModalBtn = document.getElementById("close-modal");
            const orderBtn = document.getElementById("order-history-btn");


            orderBtn.onclick = () => {
                fetch(`http://localhost:8000/orders/restaurants/${id}/orders`)
                    .then(res => res.json())
                    .then(orders => {
                        if (orders.length === 0) {
                            ordersContent.innerHTML = "<p class='text-gray-500'>No hay pedidos registrados.</p>";
                            return;
                        }

                        ordersContent.innerHTML = orders.map(order => `
                <div class="border p-4 rounded bg-gray-50">
                <p class="text-sm text-gray-500">Fecha: ${order.creationDate}</p>
                <p class="font-semibold mt-1">Total: ₡${order.total}</p>
                <div class="grid grid-cols-2 gap-3 mt-3">
                    ${order.meals.map(meal => `
                    <div class="flex items-center space-x-3">
                        <img src="/backend/${meal.thumbnailPath}" alt="${meal.name}" class="w-16 h-16 object-cover rounded">
                        <div>
                        <p class="font-medium">${meal.name}</p>
                        <p class="text-sm text-gray-600">₡${meal.price} x ${meal.amount}</p>
                        </div>
                    </div>
                    `).join("")}
                </div>
                </div>
            `).join("");
                    })
                    .catch(err => {
                        ordersContent.innerHTML = "<p class='text-red-500'>Error al cargar los pedidos.</p>";
                        console.error(err);
                    });

                orderModal.classList.remove("hidden");
            };

            closeModalBtn.onclick = () => {
                orderModal.classList.add("hidden");
            };

            const cartBtn = document.getElementById("cart-btn");

             // Permitir soltar encima del botón del carrito
            cartBtn.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necesario para permitir drop
            cartBtn.classList.add("ring-2", "ring-green-400"); // Feedback visual
            });

            cartBtn.addEventListener("dragleave", () => {
            cartBtn.classList.remove("ring-2", "ring-green-400");
            });

            cartBtn.addEventListener("drop", (e) => {
            e.preventDefault();
            cartBtn.classList.remove("ring-2", "ring-green-400");

            try {
                const data = JSON.parse(e.dataTransfer.getData("application/json"));
                const mealID = parseInt(data.mealID);
                const name = data.name;
                const price = parseFloat(data.price);
                addToCart(mealID, name, price);
            } catch (error) {
                console.error("Error al procesar drop:", error);
            }
            });



            let cart = [];

            const updateCartCount = () => {
            document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.amount, 0);
            };

            const addToCart = (mealID, name, price) => {
            const item = cart.find(i => i.mealID === mealID);
            if (item) {
                item.amount += 1;
            } else {
                cart.push({ mealID, name, price, amount: 1 });
            }
            updateCartCount();
            };

            // Añadir botones "Añadir al carrito"
            document.querySelectorAll("[data-mealid]").forEach(btn => {
            btn.addEventListener("click", () => {
                const mealID = parseInt(btn.dataset.mealid);
                const name = btn.dataset.name;
                const price = parseFloat(btn.dataset.price);
                addToCart(mealID, name, price);
            });
            });

            // Abrir modal del carrito
            document.getElementById("cart-btn").onclick = () => {
            const itemsContainer = document.getElementById("cart-items");
            if (cart.length === 0) {
                itemsContainer.innerHTML = "<p class='text-gray-500'>Tu carrito está vacío.</p>";
            } else {
                itemsContainer.innerHTML = cart.map(item => `
                <div class="flex justify-between items-center border-b pb-2">
                    <span>${item.name} x${item.amount}</span>
                    <span>₡${item.price * item.amount}</span>
                </div>
                `).join("");
            }

            const subtotal = cart.reduce((sum, i) => sum + i.price * i.amount, 0);
            const tax = Math.round(subtotal * 0.13);
            const shipping = 1000;
            const service = 500;
            const total = subtotal + tax + shipping + service;

            document.getElementById("cart-subtotal").textContent = subtotal;
            document.getElementById("cart-tax").textContent = tax;
            document.getElementById("cart-shipping").textContent = shipping;
            document.getElementById("cart-service").textContent = service;
            document.getElementById("cart-total").textContent = total;

            document.getElementById("cart-modal").classList.remove("hidden");
            };

            document.getElementById("close-cart-modal").onclick = () => {
            document.getElementById("cart-modal").classList.add("hidden");
            };

            // Confirmar compra → POST
            document.getElementById("checkout-btn").onclick = () => {
            const subtotal = cart.reduce((sum, i) => sum + i.price * i.amount, 0);
            const tax = Math.round(subtotal * 0.13);
            const shippingCost = 1000;
            const serviceCost = 500;
            const total = subtotal + tax + shippingCost + serviceCost;

            const payload = {
                subtotal,
                tax,
                shippingCost,
                serviceCost,
                total,
                meals: cart.map(i => ({ mealID: i.mealID, amount: i.amount }))
            };

            fetch(`${API_URL}/${id}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => {
                if (!res.ok) throw new Error("Fallo en la compra");
                alert("¡Compra realizada con éxito!");
                cart = [];
                updateCartCount();
                document.getElementById("cart-modal").classList.add("hidden");
                })
                .catch(err => {
                console.error(err);
                alert("Error al procesar la compra.");
                });
            };
        })
        .catch(err => {
            container.innerHTML = "<p>Error al cargar el restaurante.</p>";
            console.error(err);
        });
}


            const orderModal = document.getElementById("order-modal");
            const ordersContent = document.getElementById("orders-content");
            const closeModalBtn = document.getElementById("close-modal");
            const orderBtn = document.getElementById("order-history-btn");




            orderBtn.onclick = () => {
                fetch(`http://localhost:8000/orders/restaurants/${id}/orders`)
                    .then(res => res.json())
                    .then(orders => {
                        if (orders.length === 0) {
                            ordersContent.innerHTML = "<p class='text-gray-500'>No hay pedidos registrados.</p>";
                            return;
                        }

                        ordersContent.innerHTML = orders.map(order => `
                    <div class="border p-4 rounded bg-gray-50">
                    <p class="text-sm text-gray-500">📅 ${order.creationDate}</p>
                    <p class="font-semibold mt-1">Total: ₡${order.total}</p>
                    <div class="grid grid-cols-2 gap-3 mt-3">
                        ${order.meals.map(meal => `
                        <div class="flex items-center space-x-3">
                            <img src="/backend/${meal.thumbnailPath}" alt="${meal.name}" class="w-16 h-16 object-cover rounded">
                            <div>
                            <p class="font-medium">${meal.name}</p>
                            <p class="text-sm text-gray-600">₡${meal.price} x ${meal.amount}</p>
                            </div>
                        </div>
                        `).join("")}
                    </div>
                    </div>
                `).join("");
        })
        .catch(err => {
            ordersContent.innerHTML = "<p class='text-red-500'>Error al cargar los pedidos.</p>";
            console.error(err);
        });

    orderModal.classList.remove("hidden");
};

closeModalBtn.onclick = () => {
    orderModal.classList.add("hidden");
};

