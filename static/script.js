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
    document.getElementById("resultado").innerHTML = `
      <p><strong>Ecuación:</strong> ${ecuacion}</p>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('orden')">Orden ▼ (${data.orden})</button>
        <div id="exp-orden" class="exp oculto">
          Esta ecuación es de orden ${data.orden} porque la derivada más alta es de orden ${data.orden}.
        </div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('grado')">Grado ▼ (${data.grado})</button>
        <div id="exp-grado" class="exp oculto">
          Es de grado ${data.grado} porque aparece una derivada elevada a la potencia ${data.grado}.
        </div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('linealidad')">Linealidad ▼ (${data.linealidad})</button>
        <div id="exp-linealidad" class="exp oculto">
          ${data.linealidad === "Lineal"
            ? "Es lineal porque y y sus derivadas aparecen solo en potencia 1 y sin multiplicarse."
            : "Es no lineal porque hay potencias o productos de y o sus derivadas (ejemplo: (y'')^2)."}
        </div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('tipo')">Tipo ▼ (${data.tipo})</button>
        <div id="exp-tipo" class="exp oculto">
          ${data.tipo === "Diferencial parcial"
            ? "Es una ecuación diferencial parcial porque aparecen derivadas con el símbolo ∂."
            : "Es una ecuación diferencial ordinaria porque las derivadas son respecto a una sola variable."}
        </div>
      </div>
    `;
  });
}

function toggleExp(id) {
  const exp = document.getElementById("exp-" + id);
  exp.classList.toggle("oculto");
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

