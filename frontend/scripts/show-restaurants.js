const API_URL = "http://localhost:8000/restaurants/restaurants";
const ORDERS_URL = "http://localhost:8000/orders/restaurants";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Elementos principales
const infoDiv = document.getElementById('restaurant-info');
const mealsDiv = document.getElementById('meals-list');
const orderContainer = document.getElementById('order-container');
const historyModal = document.getElementById('history-modal');
const historyContent = document.getElementById('history-content');
const orderHistoryBtn = document.getElementById('order-history-btn');
const closeHistory = document.getElementById('close-history');
const detailsDiv = document.getElementById('restaurant-details');


let cart = [];

// Actualiza UI del pedido
const updateOrderUI = () => {
  const itemsContainer = document.getElementById('order-items');
  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="text-gray-500">Aún no has agregado ningún plato.</p>';
  } else {
    itemsContainer.innerHTML = cart.map(item => `
          <div class="flex justify-between items-center border-b pb-2">
            <div class="flex items-center gap-2">
              <span>${item.name}</span>
              <input type="number" min="1" value="${item.amount}" data-mealid="${item.mealID}" class="w-12 border rounded px-1 text-center change-qty" />
              <button data-mealid="${item.mealID}" class="remove-btn text-red-500 ml-2">✕</button>
            </div>
            <span>₡${item.price * item.amount}</span>
          </div>
        `).join('');

    // Cambiar cantidad
    document.querySelectorAll('.change-qty').forEach(input => {
      input.addEventListener('change', e => {
        const mealID = parseInt(e.target.dataset.mealid);
        const qty = parseInt(e.target.value) || 1;
        cart = cart.map(i => i.mealID === mealID ? { ...i, amount: qty } : i);
        updateOrderUI();
      });
    });
    // Remover item
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const mealID = parseInt(e.target.dataset.mealid);
        cart = cart.filter(i => i.mealID !== mealID);
        updateOrderUI();
      });
    });
  }
  // Totales
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.amount, 0);
  const tax = Math.round(subtotal * 0.13);
  const shipping = 1000;
  const service = 500;
  const total = subtotal + tax + shipping + service;
  document.getElementById('order-subtotal').textContent = subtotal;
  document.getElementById('order-tax').textContent = tax;
  document.getElementById('order-shipping').textContent = shipping;
  document.getElementById('order-service').textContent = service;
  document.getElementById('order-total').textContent = total;
};

// Agregar al carrito
const addToCart = (mealID, name, price, amount = 1) => {
  const existing = cart.find(i => i.mealID === mealID);
  if (existing) existing.amount += amount;
  else cart.push({ mealID, name, price, amount });
  updateOrderUI();
};

// Drag & Drop en carrito
orderContainer.addEventListener('dragover', e => { e.preventDefault(); orderContainer.classList.add('ring-2', 'ring-green-400'); });
orderContainer.addEventListener('dragleave', () => { orderContainer.classList.remove('ring-2', 'ring-green-400'); });
orderContainer.addEventListener('drop', e => {
  e.preventDefault(); orderContainer.classList.remove('ring-2', 'ring-green-400');
  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    addToCart(parseInt(data.mealID), data.name, parseFloat(data.price));
  } catch { };
});

// Mostrar historial
const showHistory = () => {
  historyContent.innerHTML = '<p class="text-gray-500">Cargando...</p>';
  historyModal.classList.remove('hidden');
  fetch(`${ORDERS_URL}/${id}/orders`)
    .then(res => res.json())
    .then(orders => {
      if (!orders.length) {
        historyContent.innerHTML = '<p class="text-gray-500">No hay pedidos registrados.</p>';
        return;
      }
      historyContent.innerHTML = orders.map(order => `
            <div class="border p-4 rounded bg-gray-50">
              <p class="text-sm text-gray-500">Fecha: ${order.creationDate}</p>
              <p class="font-semibold mt-1">Total: ₡${order.total}</p>
              <div class="mt-2 space-y-2">
                ${order.meals.map(meal => `
                  <div class="flex items-center gap-3">
                    <img src="/backend/${meal.thumbnailPath}" alt="${meal.name}" class="w-12 h-12 object-cover rounded">
                    <div>
                      <p class="font-medium">${meal.name}</p>
                      <p class="text-sm text-gray-600">₡${meal.price} x ${meal.amount}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('');
    })
    .catch(() => { historyContent.innerHTML = '<p class="text-red-500">Error al cargar historial.</p>' });
};

// Eventos modal
orderHistoryBtn.addEventListener('click', showHistory);
closeHistory.addEventListener('click', () => historyModal.classList.add('hidden'));

// Cargar restaurante y comidas
if (!id) {
  infoDiv.textContent = 'No se encontró el restaurante.';
} else {
  fetch(`${API_URL}/${id}`)
    .then(r => r.json())
    .then(data => {
      const restaurantImg = data.thumbnailPath
      ? `/backend/${data.thumbnailPath}`
      : 'images/placeholder.jpg';
      // Info restaurante
      detailsDiv.innerHTML = `
            <img src="${restaurantImg}" onerror="this.onerror=null; this.src='../images/placeholder.jpg'" alt="${data.name}" class="w-full h-64 object-cover rounded">
            <h1 class="text-2xl font-bold mt-4">${data.name}</h1>
            <p class="text-gray-600">Tipo: ${data.type}</p>
            <p class="text-sm mb-4">Creado: ${data.creationDate}</p>
            <p class="text-sm mb-4">Pedidos: ${data.ordersCount}</p>
          `;


      // Lista platillos
      mealsDiv.innerHTML = `
            <h2 class="text-xl font-semibold mb-4">Comidas</h2>
            <div class="grid grid-cols-2 gap-4">
              ${data.meals.map(meal => {
                const thumb = meal.thumbnailPath
                ? `/backend/${meal.thumbnailPath}`
                : '/frontend/images/placeholder.jpg';
                console.log(thumb)
                return `
              <div class="meal-card bg-white rounded-xl shadow hover:shadow-md transition p-4 flex flex-col items-center text-center"
                  draggable="true" data-mealid="${meal.id}" data-name="${meal.name}" data-price="${meal.price}">
                <img src="${thumb}" alt="${meal.name}" onerror="this.onerror=null; this.src='../images/placeholder.jpg'" class="w-28 h-28 object-cover rounded-full shadow-sm mb-3">
                <h3 class="text-lg font-semibold text-gray-800">${meal.name}</h3>
                <p class="text-blue-600 font-medium mt-1">₡${meal.price}</p>
                <div class="mt-3 flex items-center gap-2">
                  <input type="number" min="1" value="1" id="qty-${meal.id}" class="w-16 border rounded px-2 py-1 text-center" />
                  <button class="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600 add-btn"
                          data-mealid="${meal.id}" data-name="${meal.name}" data-price="${meal.price}">Añadir</button>
                </div>
              </div>
              `}).join('')}
            </div>
          `;
      // Dragstart
      document.querySelectorAll('.meal-card').forEach(card => {
        card.addEventListener('dragstart', e => {
          const { mealid, name, price } = card.dataset;
          e.dataTransfer.setData('application/json', JSON.stringify({ mealID: mealid, name, price }));
        });
      });
      // Click añadir
      document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mealID = parseInt(btn.dataset.mealid);
          const name = btn.dataset.name;
          const price = parseFloat(btn.dataset.price);
          const qty = parseInt(document.getElementById(`qty-${mealID}`).value) || 1;
          addToCart(mealID, name, price, qty);
        });
      });
    })
    .catch(() => { infoDiv.textContent = 'Error al cargar el restaurante.'; });
}


// Función para abrir el modal con tipo ('success' | 'error' | 'info') y mensaje
function showFeedback(type, message) {
  const modal   = document.getElementById('feedback-modal');
  const iconDiv = document.getElementById('feedback-icon');
  const msgP    = document.getElementById('feedback-message');

  // Ajusta el ícono según el tipo
  let icon;
  switch(type) {
    case 'success': icon = '✅'; break;
    case 'error':   icon = '❌'; break;
    default:        icon = 'ℹ️';
  }
  iconDiv.textContent = icon;
  msgP.textContent     = message;

  modal.classList.remove('hidden');
}

// Cerrar modal al hacer click en la X
document.getElementById('feedback-close')
  .addEventListener('click', () => {
    document.getElementById('feedback-modal').classList.add('hidden');
  });

// Cerrar modal al hacer click fuera del contenido
document.getElementById('feedback-modal')
  .addEventListener('click', e => {
    if (e.target.id === 'feedback-modal') {
      e.target.classList.add('hidden');
    }
  });

document.getElementById('checkout-btn').addEventListener('click', async e => {
  e.preventDefault();
  

  try {
    if (cart.length === 0) {
      showFeedback('info', 'Tu carrito está vacío.');
      return;
    }

    const payload = {
      subtotal: parseInt(document.getElementById('order-subtotal').textContent),
      tax: parseInt(document.getElementById('order-tax').textContent),
      shippingCost: parseInt(document.getElementById('order-shipping').textContent),
      serviceCost: parseInt(document.getElementById('order-service').textContent),
      total: parseInt(document.getElementById('order-total').textContent),
      meals: cart.map(i => ({ mealID: i.mealID, amount: i.amount }))
    };

    const res = await fetch(`${API_URL}/${id}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Error al procesar la compra.');

    showFeedback('success', '¡Compra exitosa!');
    

    cart = [];
    updateOrderUI();

  } catch (err) {
    console.error('Error en compra:', err);
    showFeedback('error', 'Error al procesar la compra. Intenta de nuevo.');
  }
});