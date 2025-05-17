// Referencias a elementos del DOM
const form = document.getElementById("restaurantForm");
const restaurantImageInput = document.getElementById("restaurantImageInput");
const restaurantImagePreview = document.getElementById("restaurantImagePreview");
const restaurantImagePlaceholder = document.getElementById("restaurantImagePlaceholder");
const errorRestaurantImage = document.getElementById("errorRestaurantImage");
const errorRestaurantName = document.getElementById("errorRestaurantName");
const errorRestaurantType = document.getElementById("errorRestaurantType");
const mealsContainer = document.getElementById("mealsContainer");
const addMealBtn = document.getElementById("addMealBtn");
const errorMeals = document.getElementById("errorMeals");
const loadingOverlay = document.getElementById("loadingOverlay");
const successOverlay = document.getElementById("successOverlay");
const goHomeBtn = document.getElementById("goHomeBtn");
const restaurantNameInput = document.getElementById("restaurantName");

// Validación de longitud máxima para el nombre del restaurante
const MAX_RESTAURANT_NAME_LENGTH = 150;

restaurantNameInput.addEventListener('input', function() {
    const value = this.value;
    if (value.length > MAX_RESTAURANT_NAME_LENGTH) {
        this.value = value.slice(0, MAX_RESTAURANT_NAME_LENGTH);
        errorRestaurantName.textContent = `El nombre no puede tener más de ${MAX_RESTAURANT_NAME_LENGTH} caracteres`;
        errorRestaurantName.classList.remove("hidden");
    } else {
        errorRestaurantName.classList.add("hidden");
    }
});

// Manejar el placeholder del select
const restaurantType = document.getElementById("restaurantType");
restaurantType.addEventListener('change', function() {
    if (this.value) {
        this.setAttribute('data-value', 'selected');
    } else {
        this.removeAttribute('data-value');
    }
});

// Establecer el placeholder como contenido por defecto
restaurantType.style.setProperty('--placeholder', `"${restaurantType.dataset.placeholder}"`);
restaurantType.style.setProperty('content', 'var(--placeholder)');

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

// Función para previsualizar imagen
function previewImage(input, previewElement, placeholderElement) {
    const container = previewElement.parentElement;
    const containerWrapper = container.parentElement;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Crear una imagen temporal para obtener las dimensiones reales
            const tempImg = new Image();
            tempImg.src = e.target.result;
            
            tempImg.onload = function() {
                const width = this.width;
                const height = this.height;
                const ratio = width / height;
                
                // Establecer dimensiones máximas
                const maxWidth = Math.min(800, containerWrapper.offsetWidth);
                const maxHeight = 400;
                
                let newWidth, newHeight;
                
                // Calcular dimensiones manteniendo la proporción
                if (width > height) {
                    // Imagen horizontal
                    newWidth = Math.min(width, maxWidth);
                    newHeight = newWidth / ratio;
                    
                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = newHeight * ratio;
                    }
                } else {
                    // Imagen vertical o cuadrada
                    newHeight = Math.min(height, maxHeight);
                    newWidth = newHeight * ratio;
                }
                
                // Centrar el contenedor con el nuevo ancho
                container.style.width = `${newWidth}px`;
                container.style.height = `${newHeight}px`;
                
                // Mostrar la imagen y ocultar el placeholder
                previewElement.src = e.target.result;
                previewElement.classList.remove('hidden');
                if (placeholderElement) {
                    placeholderElement.classList.add('hidden');
                }
            };
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        // Restaurar el ancho completo y la altura original
        container.style.width = '100%';
        container.style.height = container.id === 'restaurantImageDrop' ? '10rem' : '8rem';
        previewElement.classList.add('hidden');
        if (placeholderElement) {
            placeholderElement.classList.remove('hidden');
        }
    }
}

// Validar imagen del restaurante al seleccionarla
restaurantImageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        if (!validateImage(file, MAX_RESTAURANT_IMG_SIZE)) {
            errorRestaurantImage.textContent = "La imagen debe ser JPG y no exceder 5 MB";
            errorRestaurantImage.classList.remove("hidden");
            this.value = ''; // Limpiar el input
            if (restaurantImagePreview) {
                restaurantImagePreview.classList.add('hidden');
                restaurantImagePlaceholder.classList.remove('hidden');
            }
            return;
        }
        errorRestaurantImage.classList.add("hidden");
        previewImage(this, restaurantImagePreview, restaurantImagePlaceholder);
    }
});

// Función para configurar la validación de imagen de comida
function setupMealImageValidation(mealCard) {
    const input = mealCard.querySelector('.meal-image-input');
    const errorElement = mealCard.querySelector('.meal-error-image');
    const preview = mealCard.querySelector('.meal-image-preview');
    const placeholder = mealCard.querySelector('.meal-image-placeholder');
    
    input.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (!validateImage(file, MAX_MEAL_IMG_SIZE)) {
                errorElement.textContent = "La imagen debe ser JPG y no exceder 2 MB";
                errorElement.classList.remove("hidden");
                this.value = ''; // Limpiar el input
                if (preview) {
                    preview.classList.add('hidden');
                    placeholder.classList.remove('hidden');
                }
                return;
            }
            errorElement.classList.add("hidden");
            previewImage(this, preview, placeholder);
        }
    });
}

// Modificar la función que agrega comidas para incluir la validación
addMealBtn.addEventListener("click", () => {
    const tpl = document.getElementById("mealTemplate");
    const clone = tpl.content.cloneNode(true);
    mealsContainer.appendChild(clone);
    
    // Configurar previsualización y validación para la nueva tarjeta
    const newCard = mealsContainer.lastElementChild;
    setupMealImageValidation(newCard);
    
    
});


// Manejo del envío del formulario
// Manejo del envío del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();

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
  if (restFile && !validateImage(restFile, MAX_RESTAURANT_IMG_SIZE)) {
    valid = false;
    errorRestaurantImage.textContent = "Formato inválido o tamaño > 5 MB";
    errorRestaurantImage.classList.remove("hidden");
  }

  // 2) Validar nombre del restaurante (requerido, max 150)
  const name = form.restaurantName.value.trim();
  if (!name) {
    valid = false;
    errorRestaurantName.textContent = "Este campo es obligatorio";
    errorRestaurantName.classList.remove("hidden");
  } else if (name.length > MAX_RESTAURANT_NAME_LENGTH) {
    valid = false;
    errorRestaurantName.textContent = `El nombre no puede tener más de ${MAX_RESTAURANT_NAME_LENGTH} caracteres`;
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
  const mealImages = [];
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
    if (imgInput.files[0] && !validateImage(imgInput.files[0], MAX_MEAL_IMG_SIZE)) {
      valid = false;
      const e = card.querySelector(".meal-error-image");
      e.textContent = "Formato inválido o > 2 MB";
      e.classList.remove("hidden");
    }

    // Si pasa validación, agregar al array
    meals.push({
      name: nameInput.value.trim(),
      price: parseFloat(priceInput.value),
    });
    
    // Agregar imagen de comida si existe
    if (imgInput.files[0]) {
      mealImages.push(imgInput.files[0]);
    } else {
      mealImages.push(null);
    }
  });

  if (!valid) {
    // Si hay errores, no continuar
    return;
  }

  // 5) Mostrar overlay de carga
  loadingOverlay.classList.remove("hidden");

  // Preparar objeto final para el endpoint
  const formData = new FormData();
  
  // Agregar los datos del restaurante como JSON
  const restaurantData = {
    name: name,
    type: type,
    meals: meals
  };
  formData.append('restaurant_data', JSON.stringify(restaurantData));
  
  // Agregar imagen del restaurante si existe
  if (restFile) {
    formData.append('restaurant_image', restFile);
  }
  
  // Agregar imágenes de comidas
  mealImages.forEach((img, index) => {
    if (img) {
      formData.append('meal_images', img);
    }
  });

  try {
    // Enviar datos al endpoint
    const response = await fetch('http://localhost:8000/restaurants/add-restaurant', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const result = await response.json();
    console.log('Restaurante creado:', result);

    // 6) Ocultar overlay de carga, mostrar mensaje de éxito
    loadingOverlay.classList.add("hidden");
    successOverlay.classList.remove("hidden");
  } catch (err) {
    console.error('Error al enviar el formulario:', err);
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