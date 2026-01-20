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
  // Engancha todos los botones con data-value
  document.querySelectorAll("#teclado button[data-value]").forEach(btn => {
    btn.addEventListener("click", () => {
      insertar(btn.getAttribute("data-value"));
    });
  });

  // Botones especiales
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
    // Recalcular linealidad en frontend para doble validación
    const linealidadFrontend = esLineal(ecuacion);

    document.getElementById("resultado").innerHTML = `
      <p><strong>Orden:</strong> ${data.orden}</p>
      <p><strong>Grado:</strong> ${data.grado}</p>
      <p><strong>Linealidad:</strong> ${linealidadFrontend}</p>
      <p><strong>Tipo:</strong> ${data.tipo}</p>
      <button class="btn-small" onclick="toggleDetalles()">Ver más</button>
      <div id="detalles" class="detalles oculto">
        <p><strong>Orden:</strong> ${data.orden} porque la derivada más alta es de orden ${data.orden}.</p>
        <p><strong>Grado:</strong> ${data.grado} porque la derivada aparece elevada a la potencia ${data.grado}.</p>
        <p><strong>Linealidad:</strong> ${linealidadFrontend} porque ${
          linealidadFrontend === "Lineal"
            ? "y y sus derivadas aparecen solo en potencia 1 y sin productos entre ellas."
            : "hay potencias o productos de y o sus derivadas (por ejemplo, (y')^3)."
        }</p>
        <p><strong>Tipo:</strong> ${data.tipo} porque ${
          data.tipo === "Diferencial parcial"
            ? "aparecen derivadas parciales (∂)."
            : "las derivadas son respecto a una sola variable."
        }</p>
      </div>
    `;
  });
}

function toggleDetalles() {
  const detalles = document.getElementById("detalles");
  detalles.classList.toggle("oculto");
}

// --- Detector de linealidad en frontend ---
function esLineal(eqRaw) {
  const eq = eqRaw.replace(/\s+/g, "");

  // Potencias de y o derivadas: (y')^n, y'^n, (y'')^n
  if (/\(y('{1,3})\)\^\d+/.test(eq) || /y('{1,3})\^\d+/.test(eq)) return "No lineal";

  // Productos entre y y derivadas
  if (/(y('{1,3})?|y)\*(y('{1,3})?|y)/.test(eq)) return "No lineal";

  // Potencias de derivadas parciales
  if (/\(∂[a-zA-Z]+\/∂[a-zA-Z]+\)\^\d+/.test(eq)) return "No lineal";

  return "Lineal";
}
