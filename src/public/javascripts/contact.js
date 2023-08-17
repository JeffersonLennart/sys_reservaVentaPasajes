document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formulario")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("name").value;
      var email = document.getElementById("email").value;
      var subject = document.getElementById("subject").value;
      var message = document.getElementById("message").value;

      console.log("Nombre:", name);
      console.log("Correo Electrónico:", email);
      console.log("Asunto:", subject);
      console.log("Mensaje:", message);
    });
});
