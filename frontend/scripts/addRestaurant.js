// —— referencias DOM —————————————————————————

const refs = {
  form: document.getElementById("restaurantForm"),
  restaurantImageInput: document.getElementById("restaurantImageInput"),
  restaurantImagePreview: document.getElementById("restaurantImagePreview"),
  restaurantImagePlaceholder: document.getElementById("restaurantImagePlaceholder"),
  errorRestaurantImage: document.getElementById("errorRestaurantImage"),
  errorRestaurantName: document.getElementById("errorRestaurantName"),
  errorRestaurantType: document.getElementById("errorRestaurantType"),
  mealsContainer: document.getElementById("mealsContainer"),
  addMealBtn: document.getElementById("addMealBtn"),
  errorMeals: document.getElementById("errorMeals"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  successOverlay: document.getElementById("successOverlay"),
  goHomeBtn: document.getElementById("goHomeBtn"),
  restaurantNameInput: document.getElementById("restaurantName"),
  restaurantType: document.getElementById("restaurantType"),
  submitButton: document.getElementById("submitButton"),
};

// —— constantes ————————————————————————————————
const MAX_RESTAURANT_NAME_LENGTH = 150;
const MAX_RESTAURANT_IMG_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_MEAL_IMG_SIZE = 2 * 1024 * 1024;       // 2 MB
const API_URL = "http://localhost:8000/restaurants/add-restaurant";
// —— utilidades ————————————————————————————————
function validateImage(file, maxSize) {
  if (!file) return true;
  return file.type === "image/jpeg" && file.size <= maxSize;
}

function previewImage(input, previewEl, placeholderEl) {
  const container = previewEl.parentElement;
  const wrapper   = container.parentElement;
  if (!input.files?.[0]) {
    container.style.width  = "100%";
    container.style.height = container.id === "restaurantImageDrop" ? "10rem" : "8rem";
    previewEl.classList.add("hidden");
    placeholderEl?.classList.remove("hidden");
    return;
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      let { width, height } = img;
      const ratio = width/height;
      const maxW = Math.min(800, wrapper.offsetWidth);
      const maxH = 400;
      let newW, newH;
      if (width > height) {
        newW = Math.min(width, maxW);
        newH = Math.min(newW/ratio, maxH);
      } else {
        newH = Math.min(height, maxH);
        newW = newH * ratio;
      }
      container.style.width  = `${newW}px`;
      container.style.height = `${newH}px`;
      previewEl.src = e.target.result;
      previewEl.classList.remove("hidden");
      placeholderEl?.classList.add("hidden");
    };
  };
  reader.readAsDataURL(file);
}

// —— validaciones específicas ————————————————————
function handleRestaurantImageChange() {
  const file = refs.restaurantImageInput.files[0];
  if (file && !validateImage(file, MAX_RESTAURANT_IMG_SIZE)) {
    refs.errorRestaurantImage.textContent = "La imagen debe ser JPG y no exceder 5 MB";
    refs.errorRestaurantImage.classList.remove("hidden");
    refs.restaurantImageInput.value = "";
    refs.restaurantImagePreview.classList.add("hidden");
    refs.restaurantImagePlaceholder.classList.remove("hidden");
    return;
  }
  refs.errorRestaurantImage.classList.add("hidden");
  previewImage(refs.restaurantImageInput, refs.restaurantImagePreview, refs.restaurantImagePlaceholder);
}

function setupMealImageValidation(mealCard) {
  const input = mealCard.querySelector('.meal-image-input');
  const err   = mealCard.querySelector('.meal-error-image');
  const prev  = mealCard.querySelector('.meal-image-preview');
  const ph    = mealCard.querySelector('.meal-image-placeholder');
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file && !validateImage(file, MAX_MEAL_IMG_SIZE)) {
      err.textContent = "La imagen debe ser JPG y no exceder 2 MB";
      err.classList.remove("hidden");
      input.value = "";
      prev.classList.add("hidden");
      ph.classList.remove("hidden");
    } else {
      err.classList.add("hidden");
      previewImage(input, prev, ph);
    }
  });
}

// —— gestión de comidas ————————————————————————
function addMealCard() {
  const tpl   = document.getElementById("mealTemplate");
  const clone = tpl.content.cloneNode(true);
  refs.mealsContainer.appendChild(clone);
  const newCard = refs.mealsContainer.lastElementChild;
  setupMealImageValidation(newCard);
}

// —— validación y recolección de datos ————————————
function collectMeals() {
  const cards = [...refs.mealsContainer.querySelectorAll("div.relative.border")];
  const meals = [];
  const images = [];
  cards.forEach(card => {
    const nameI = card.querySelector('input[name="mealName[]"]');
    const priceI= card.querySelector('input[name="mealPrice[]"]');
    const imgI  = card.querySelector('input[name="mealImage[]"]');
    if (!nameI.value.trim() || !priceI.value || +priceI.value < 0) return;
    meals.push({ name: nameI.value.trim(), price: +priceI.value });
    images.push(imgI.files[0] || null);
  });
  return { meals, images };
}

function validateForm() {
  let ok = true;
  // reset errores
  [refs.errorRestaurantImage, refs.errorRestaurantName, refs.errorRestaurantType, refs.errorMeals]
    .forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".meal-error-name, .meal-error-price, .meal-error-image")
    .forEach(el => el.classList.add("hidden"));

  // imagen restaurante
  const restFile = refs.restaurantImageInput.files[0];
  if (restFile && !validateImage(restFile, MAX_RESTAURANT_IMG_SIZE)) {
    refs.errorRestaurantImage.textContent = "Formato inválido o > 5 MB";
    refs.errorRestaurantImage.classList.remove("hidden");
    ok = false;
  }
  // nombre
  const name = refs.form.restaurantName.value.trim();
  if (!name || name.length > MAX_RESTAURANT_NAME_LENGTH) {
    refs.errorRestaurantName.textContent = !name
      ? "Este campo es obligatorio"
      : `Máx ${MAX_RESTAURANT_NAME_LENGTH} caracteres`;
    refs.errorRestaurantName.classList.remove("hidden");
    ok = false;
  }
  // tipo
  if (!refs.form.restaurantType.value) {
    refs.errorRestaurantType.textContent = "Seleccione un tipo";
    refs.errorRestaurantType.classList.remove("hidden");
    ok = false;
  }
  // comidas
  const { meals } = collectMeals();
  if (meals.length === 0) {
    refs.errorMeals.textContent = "Debe agregar al menos una comida";
    refs.errorMeals.classList.remove("hidden");
    ok = false;
  }
  return ok;
}

// —— envío del formulario ————————————————————————
async function handleSubmit(evt) {
  evt.preventDefault();
  if (!validateForm()) return;

  refs.loadingOverlay.classList.remove("hidden");
  const restFile = refs.restaurantImageInput.files[0];
  const { meals, images } = collectMeals();

  const fd = new FormData();
  fd.append("restaurant_data", JSON.stringify({
    name: refs.form.restaurantName.value.trim(),
    type: refs.form.restaurantType.value,
    meals
  }));
  if (restFile) fd.append("restaurant_image", restFile, restFile.name);
  images.forEach(img => img && fd.append("meal_images", img, img.name));

  fetch(API_URL, {
    method: "POST",
    body: fd
  })
    .then(res => {
      refs.loadingOverlay.classList.add("hidden");
      debugger;
      if (!res.ok) throw new Error();
      refs.successOverlay.classList.remove("hidden");
      refs.form.classList.add("hidden");
    })
    .catch(() => {
      refs.loadingOverlay.classList.add("hidden");
      refs.errorMeals.textContent = "Error al crear el restaurante. Intente de nuevo.";
      refs.errorMeals.classList.remove("hidden");
    });
}
function removeMeal(btn) {
  btn.closest("div.border").remove();
}
// —— inicialización —————————————————————————————
function init() {
  // placeholder select
  refs.restaurantType.style.setProperty('--placeholder', `"${refs.restaurantType.dataset.placeholder}"`);
  refs.restaurantType.style.setProperty('content', 'var(--placeholder)');

  // listeners
  refs.restaurantNameInput .addEventListener("input", () => {
    if (refs.restaurantNameInput.value.length > MAX_RESTAURANT_NAME_LENGTH) {
      refs.restaurantNameInput.value = refs.restaurantNameInput.value.slice(0, MAX_RESTAURANT_NAME_LENGTH);
      refs.errorRestaurantName.textContent = `Máx ${MAX_RESTAURANT_NAME_LENGTH} caracteres`;
      refs.errorRestaurantName.classList.remove("hidden");
    } else {
      refs.errorRestaurantName.classList.add("hidden");
    }
  });
  refs.form.addEventListener("submit", handleSubmit);
  refs.restaurantType.addEventListener("change", () => {
    refs.restaurantType.dataset.value = refs.restaurantType.value ? "selected" : "";
  });

  refs.restaurantImageInput.addEventListener("change", handleRestaurantImageChange);
  refs.addMealBtn           .addEventListener("click", addMealCard);
  refs.goHomeBtn            .addEventListener("click", () => window.location.href = "/frontend");
}

// —— arranca todo ————————————————————————————————
init();
