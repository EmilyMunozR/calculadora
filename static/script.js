function insertar(texto) {
  const input = document.getElementById("ecuacion");
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const current = input.value;
  input.value = current.slice(0, start) + texto + current.slice(end);
  input.selectionStart = input.selectionEnd = start + texto.length;
  input.focus();
}

function borrar() {
  const input = document.getElementById("ecuacion");
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  if (start === end && start > 0) {
    input.value = input.value.slice(0, start - 1) + input.value.slice(end);
    input.selectionStart = input.selectionEnd = start - 1;
  } else {
    input.value = input.value.slice(0, start) + input.value.slice(end);
    input.selectionStart = input.selectionEnd = start;
  }
  input.focus();
}

function limpiar() {
  document.getElementById("ecuacion").value = "";
  document.getElementById("resultado").innerHTML = `
    <p><strong>Orden:</strong> -</p>
    <p><strong>Grado:</strong> -</p>
    <p><strong>Linealidad:</strong> -</p>
    <p><strong>Tipo:</strong> -</p>
    <button class="btn-small" onclick="toggleDetalles()">Ver más</button>
    <div id="detalles" class="detalles oculto"></div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#teclado button[data-value]").forEach(btn => {
    btn.addEventListener("click", () => insertar(btn.getAttribute("data-value")));
  });
  document.getElementById("borrar").addEventListener("click", borrar);
  document.getElementById("limpiar").addEventListener("click", limpiar);
  document.getElementById("resolver").addEventListener("click", clasificar);
});

function clasificar() {
  const ecuacion = document.getElementById("ecuacion").value;

  fetch("/clasificar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ ecuacion })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("resultado").innerHTML = `
      <p><strong>Orden:</strong> ${data.orden}</p>
      <p><strong>Grado:</strong> ${data.grado}</p>
      <p><strong>Linealidad:</strong
