const API_URL = "http://localhost:8000/restaurants/restaurants/search";

const params = new URLSearchParams(window.location.search);
const q = params.get("q");

const resultsContainer = document.getElementById("results");
const noResults = document.getElementById("no-results");

const title = document.getElementById("site-title");
if (title) {
  title.onclick = () => location.href = "../index.html";
}

if (!q) {
  location.href = "../index.html";
} else {
  fetch(`${API_URL}?q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        noResults.classList.remove("hidden");
        return;
      }

      data.forEach(r => {
        const name = r.name || "Nombre no disponible";
        const type = r.type || "Tipo desconocido";
        const thumbnailPath = r.thumbnailPath
          ? `/backend/${r.thumbnailPath}`
          : "../images/placeholder.png";

        const card = document.createElement("div");
        card.className = "bg-white rounded shadow hover:shadow-lg transition cursor-pointer";
        card.onclick = () => location.href = `/frontend/pages/show-restaurants.html?id=${r.id}`;
        card.innerHTML = `
          <img src="${thumbnailPath}" class="w-full h-48 object-cover rounded-t-lg" alt="${name}" />
          <div class="p-3">
            <h3 class="font-bold">${name}</h3>
            <p class="text-sm text-gray-600">${type}</p>
          </div>
        `;
        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error al buscar restaurantes:", err);
      noResults.innerHTML = "Error al cargar resultados. Intenta más tarde.";
      noResults.classList.remove("hidden");
    });
}
