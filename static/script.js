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
    // --- Construir explicaciones usando la ecuación ---
    let expOrden = "";
    if (ecuacion.includes("y'''")) {
      expOrden = `Es de orden 3 porque en la ecuación aparece "${ecuacion.match(/y'''/)}", que es una derivada de tercer orden.`;
    } else if (ecuacion.includes("y''")) {
      expOrden = `Es de orden 2 porque en la ecuación aparece "${ecuacion.match(/y''/)}", que es una derivada de segundo orden.`;
    } else if (ecuacion.includes("y'")) {
      expOrden = `Es de orden 1 porque en la ecuación aparece "${ecuacion.match(/y'/)}", que es una derivada de primer orden.`;
    } else if (ecuacion.includes("∂^2")) {
      expOrden = `Es de orden 2 porque en la ecuación aparece "${ecuacion.match(/∂\^2[^ ]+/)}", que indica derivada parcial de segundo orden.`;
    } else if (ecuacion.includes("∂")) {
      expOrden = `Es de orden 1 porque en la ecuación aparece "${ecuacion.match(/∂[^ ]+/)}", que indica derivada parcial de primer orden.`;
    }

    let expGrado = "";
    const gradoMatch = ecuacion.match(/\^(\d+)/);
    if (gradoMatch) {
      expGrado = `Es de grado ${gradoMatch[1]} porque en la ecuación aparece "${ecuacion.match(/\(.*?\)\^\d+/)}", que está elevado a la potencia ${gradoMatch[1]}.`;
    } else {
      expGrado = `Es de grado 1 porque ninguna derivada aparece elevada a potencia mayor que 1.`;
    }

    let expLinealidad = "";
    if (data.linealidad === "Lineal") {
      expLinealidad = `Es lineal porque en la ecuación "${ecuacion}" todas las derivadas y la función aparecen solitas, sin multiplicarse ni elevarse.`;
    } else {
      expLinealidad = `Es no lineal porque en la ecuación aparece un término como "${ecuacion.match(/\(y.*?\)\^\d+/)}" que es una potencia de una derivada.`;
    }

    let expTipo = "";
    if (data.tipo === "Diferencial parcial") {
      expTipo = `Es diferencial parcial porque en la ecuación aparece el símbolo "∂", indicando derivadas respecto a varias variables.`;
    } else if (data.tipo === "Diferencial ordinaria") {
      expTipo = `Es diferencial ordinaria porque en la ecuación aparecen derivadas con comillas (ej. "y'"), respecto a una sola variable.`;
    } else {
      expTipo = `Es algebraica porque en la ecuación "${ecuacion}" no aparecen derivadas.`;
    }

    // --- Renderizar resultado con desplegables ---
    document.getElementById("resultado").innerHTML = `
      <p><strong>Ecuación:</strong> ${ecuacion}</p>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('orden')">Orden ▼ (${data.orden})</button>
        <div id="exp-orden" class="exp oculto">${expOrden}</div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('grado')">Grado ▼ (${data.grado})</button>
        <div id="exp-grado" class="exp oculto">${expGrado}</div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('linealidad')">Linealidad ▼ (${data.linealidad})</button>
        <div id="exp-linealidad" class="exp oculto">${expLinealidad}</div>
      </div>

      <div class="detalle">
        <button class="toggle" onclick="toggleExp('tipo')">Tipo ▼ (${data.tipo})</button>
        <div id="exp-tipo" class="exp oculto">${expTipo}</div>
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


