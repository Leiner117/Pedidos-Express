
// Referencias a elementos del DOM
const form = document.getElementById("restaurantForm");
const restaurantImageInput = document.getElementById("restaurantImageInput");
const errorRestaurantImage = document.getElementById("errorRestaurantImage");
const errorRestaurantName = document.getElementById("errorRestaurantName");
const errorRestaurantType = document.getElementById("errorRestaurantType");
const mealsContainer = document.getElementById("mealsContainer");
const addMealBtn = document.getElementById("addMealBtn");
const errorMeals = document.getElementById("errorMeals");
const loadingOverlay = document.getElementById("loadingOverlay");
const successOverlay = document.getElementById("successOverlay");
const goHomeBtn = document.getElementById("goHomeBtn");

// Constantes de tamaño máximo
const MAX_RESTAURANT_IMG_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_MEAL_IMG_SIZE = 2 * 1024 * 1024; // 2 MB

// Función auxiliar: valida tipo y tamaño de imagen (.jpg)
function validateImage(file, maxSize) {
  if (!file) return true; // opcional
  if (file.type !== "image/jpeg") return false;
  if (file.size > maxSize) return false;
  return true;
}

// Elimina una tarjeta de comida
function removeMeal(btn) {
  btn.closest("div.border").remove();
}

// Agrega dinámicamente una nueva tarjeta de comida clonando el template
addMealBtn.addEventListener("click", () => {
  const tpl = document.getElementById("mealTemplate");
  const clone = tpl.content.cloneNode(true);
  mealsContainer.appendChild(clone);
  mealsContainer.lastElementChild.scrollIntoView({ behavior: "smooth" });
});

// Al cargar la página, agregamos una tarjeta de comida inicial
window.addEventListener("DOMContentLoaded", () => {
  addMealBtn.click();
});

// Manejo del envío del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ocultar errores previos
  [
    errorRestaurantImage,
    errorRestaurantName,
    errorRestaurantType,
    errorMeals,
  ].forEach((el) => el.classList.add("hidden"));
  document
    .querySelectorAll(".meal-error-name, .meal-error-price, .meal-error-image")
    .forEach((el) => el.classList.add("hidden"));

  let valid = true;

  // 1) Validar imagen del restaurante (.jpg ≤ 5 MB)
  const restFile = restaurantImageInput.files[0];
  if (!validateImage(restFile, MAX_RESTAURANT_IMG_SIZE)) {
    valid = false;
    errorRestaurantImage.textContent = "Formato inválido o tamaño > 5 MB";
    errorRestaurantImage.classList.remove("hidden");
  }

  // 2) Validar nombre del restaurante (requerido, max 100)
  const name = form.restaurantName.value.trim();
  if (!name) {
    valid = false;
    errorRestaurantName.textContent = "Este campo es obligatorio";
    errorRestaurantName.classList.remove("hidden");
  }

  // 3) Validar tipo de restaurante (requerido)
  const type = form.restaurantType.value;
  if (!type) {
    valid = false;
    errorRestaurantType.textContent = "Seleccione un tipo";
    errorRestaurantType.classList.remove("hidden");
  }

  // 4) Validar y recolectar comidas
  const mealCards = mealsContainer.querySelectorAll("div.relative.border");
  if (mealCards.length === 0) {
    valid = false;
    errorMeals.textContent = "Debe agregar al menos una comida";
    errorMeals.classList.remove("hidden");
  }

  const meals = [];
  mealCards.forEach((card) => {
    const nameInput = card.querySelector('input[name="mealName[]"]');
    const priceInput = card.querySelector('input[name="mealPrice[]"]');
    const imgInput = card.querySelector('input[name="mealImage[]"]');

    // Nombre comida (requerido, max 150)
    if (!nameInput.value.trim()) {
      valid = false;
      const e = card.querySelector(".meal-error-name");
      e.textContent = "Nombre obligatorio";
      e.classList.remove("hidden");
    }

    // Precio (requerido, ≥ 0)
    if (!priceInput.value || parseFloat(priceInput.value) < 0) {
      valid = false;
      const e = card.querySelector(".meal-error-price");
      e.textContent = "Precio inválido";
      e.classList.remove("hidden");
    }

    // Imagen comida (opcional, .jpg ≤ 2 MB)
    if (!validateImage(imgInput.files[0], MAX_MEAL_IMG_SIZE)) {
      valid = false;
      const e = card.querySelector(".meal-error-image");
      e.textContent = "Formato inválido o > 2 MB";
      e.classList.remove("hidden");
    }

    // Si pasa validación, agregar al array
    meals.push({
      name: nameInput.value.trim(),
      price: parseFloat(priceInput.value),
      image: imgInput.files[0] ? imgInput.files[0].name : null,
    });
  });

  if (!valid) {
    // Si hay errores, no continuar
    return;
  }

  // 5) Mostrar overlay de carga
  loadingOverlay.classList.remove("hidden");

  // Preparar objeto final
  const formData = {
    restaurantName: name,
    restaurantType: type,
    restaurantImage: restFile ? restFile.name : null,
    meals: meals,
  };

  // Aquí se “envía” el formulario (de momento, solo imprimimos)
  console.log("Enviando formulario:", formData);

  try {
    // Simulación de petición al servidor
    await new Promise((r) => setTimeout(r, 2000));

    // 6) Ocultar overlay de carga, mostrar mensaje de éxito
    loadingOverlay.classList.add("hidden");
    successOverlay.classList.remove("hidden");
  } catch (err) {
    // En caso de error real de envío
    loadingOverlay.classList.add("hidden");
    errorMeals.textContent = "Error al crear el restaurante. Intente de nuevo.";
    errorMeals.classList.remove("hidden");
  }
});

// Redirigir al home cuando el usuario cierra el modal de éxito
goHomeBtn.addEventListener("click", () => {
  window.location.href = "/";
});
