document.addEventListener("DOMContentLoaded", function () {
  // Obtén todos los formularios de agregar al carrito
  const addToCartForms = document.querySelectorAll(".add-to-cart-form");

  // Itera sobre todos los formularios
  addToCartForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Evita el envío del formulario por defecto

      // Obtén el cartId y productId del formulario
      const cartId = form.querySelector(".cart-id").value; // Asumiendo que agregas el cartId en un input hidden
      const productId = form.querySelector(".product-id").value; // El productId lo puedes obtener de un campo oculto o de la URL

      // Aquí puedes agregar la lógica para enviar el producto al carrito, como una llamada a la API
      console.log("Producto agregado al carrito:", cartId, productId);

      // Ejemplo: Redirigir al carrito después de agregar el producto
      // window.location.href = `/cart/${cartId}`;
    });
  });
});
