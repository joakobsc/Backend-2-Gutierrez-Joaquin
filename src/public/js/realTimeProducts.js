const socket = io();

// Solicitar la contraseña al cargar la página
function requestPassword() {
  Swal.fire({
    icon: "warning",
    title: "Acceso restringido",
    text: "Ingrese la contraseña para modificar los productos en tiempo real (contraseña= 'admin').",
    input: "password",
    inputPlaceholder: "Contraseña",
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return "Por favor, ingrese una contraseña.";
      } else if (value !== "admin") {
        return "Contraseña incorrecta. Intente nuevamente.";
      } else {
        // Si la contraseña es correcta, puedes permitir el acceso
        return null; // No hay error
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Aquí puedes cargar la lista de productos o cualquier otra acción
      const welcomeMessage = document.getElementById("welcome-message");
      welcomeMessage.innerHTML = `<h2>¡Bienvenido a Real Time Products!</h2>`;
      // Aquí puedes agregar cualquier otra lógica que necesites para cargar productos
    } else {
      // Si se cancela, volver a solicitar la contraseña
      requestPassword();
    }
  });
}

// Llamar a la función de solicitud de contraseña al cargar la página
requestPassword();

// Escucha el evento "productList" y renderiza los productos en tiempo real
socket.on("productList", (products) => {
  renderProducts(products); // Actualiza el DOM con los productos recibidos
});

// Renderiza la lista de productos en la página
function renderProducts(products) {
  const productListContainer = document.getElementById("product-list");
  productListContainer.innerHTML = ""; // Limpia la lista actual

  products.forEach((product) => {
    const productItem = document.createElement("li");
    productItem.textContent = `${product.title} - $${product.price}`;

    // Botón para eliminar el producto
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => {
      // Emitir el evento para eliminar el producto
      socket.emit("deleteProduct", product.id);
    });

    productItem.appendChild(deleteButton);
    productListContainer.appendChild(productItem);
  });
}

// Emitir eventos desde el cliente para agregar productos
document.getElementById("product-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const title = e.target.title.value;
  const price = parseFloat(e.target.price.value);
  const description = e.target.description.value;
  const code = e.target.code.value;
  const stock = parseInt(e.target.stock.value);
  const category = e.target.category.value;

  const product = {
    title,
    price,
    description,
    code,
    stock,
    category,
    status: true,
  };
  // Emitir el evento para agregar un nuevo producto
  socket.emit("addProduct", product);
  e.target.reset();
});
