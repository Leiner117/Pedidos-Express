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
              <div class="bg-gray-100 p-3 rounded">
                <img src="/backend/${meal.thumbnailPath}" alt="${meal.name}" class="h-32 w-full object-cover rounded">
                <p class="font-medium mt-2">${meal.name}</p>
                <p class="text-sm text-gray-700">₡${meal.price}</p>
              </div>
            `).join("")}
          </div>
        </div>
      `;

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
        })
        .catch(err => {
            container.innerHTML = "<p>Error al cargar el restaurante.</p>";
            console.error(err);
        });
}

console.log("Creando el modal de pedidos");
const orderModal = document.getElementById("order-modal");
const ordersContent = document.getElementById("orders-content");
const closeModalBtn = document.getElementById("close-modal");
const orderBtn = document.getElementById("order-history-btn");


console.log(orderBtn, closeModalBtn, orderModal, ordersContent);

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

