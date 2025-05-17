const API_BASE = "http://localhost:8000/restaurants/restaurants";

document.getElementById("site-title").onclick = () => location.href = "index.html";

document.getElementById("search-btn").onclick = () => {
  const query = document.getElementById("search-input").value.trim();
  if (query) {
    location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
  }
};

function createRestaurantCard(r) {
  const div = document.createElement("div");
  div.className = "min-w-[200px] bg-white rounded shadow cursor-pointer hover:shadow-lg transition";

  const imgSrc = r.thumbnailPath
    ? `/backend/${r.thumbnailPath}`
    : `./images/placeholder.jpg`; 

  div.innerHTML = `
    <img src="${imgSrc}" onerror="this.onerror=null; this.src='./images/placeholder.jpg'" class="h-36 w-full object-cover rounded-t" alt="${r.name}">
    <div class="p-3">
      <h3 class="font-bold">${r.name}</h3>
      <p class="text-sm text-gray-600">${r.type}</p>
    </div>
  `;
  div.onclick = () => location.href = `./pages/show-restaurants.html?id=${r.id}`;
  return div;
}


function renderSection(url, containerId) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      data.forEach(r => container.appendChild(createRestaurantCard(r)));
    })
    .catch(err => {
      console.error("Error cargando:", containerId, err);
      document.getElementById(containerId).innerHTML = "<p class='text-red-500'>Error al cargar los restaurantes.</p>";
    });
}

renderSection(`${API_BASE}`, "all-restaurants");
renderSection(`${API_BASE}/favorites-recent`, "favorites");
renderSection(`${API_BASE}/top-ordered/`, "top-orders");
