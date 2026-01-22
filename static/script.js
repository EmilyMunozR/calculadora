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
  document.getElementById("resultado").innerHTML = `<p><strong>Ecuación:</strong> -</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#teclado button[data-value]").forEach(btn => {
    btn.addEventListener("click", () => {
      insertar(btn.getAttribute("data-value"));
    });
  });

  document.getElementById("borrar").addEventListener("click", borrar);
  document.getElementById("limpiar").addEventListener("click", limpiar);
  document.getElementById("resolver").addEventListener("click", clasificar);
});

function clasificar() {
  const ecuacion = document.getElementById("ecuacion").value.trim();

  fetch("/clasificar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ ecuacion })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error); // ⚠️ Alerta si no es diferencial
      document.getElementById("resultado").innerHTML = `
        <p><strong>Ecuación:</strong> ${ecuacion}</p>
        <p style="color:red;">${data.error}</p>
      `;
      return;
    }

    // Render normal si sí es diferencial
    document.getElementById("resultado").innerHTML = `
      <p><strong>Ecuación:</strong> ${ecuacion}</p>
      <div class="detalle">
        <span><strong>Orden:</strong> ${data.orden}</span>
        <button class="exp-btn" onclick="toggleExp('orden')">▼</button>
        <div id="exp-orden" class="exp oculto">
          Esta ecuación es de orden ${data.orden} porque aparece la derivada de mayor orden en "${ecuacion}".
        </div>
      </div>

      <div class="detalle">
        <span><strong>Grado:</strong> ${data.grado}</span>
        <button class="exp-btn" onclick="toggleExp('grado')">▼</button>
        <div id="exp-grado" class="exp oculto">
          Es de grado ${data.grado} porque la derivada aparece elevada a la potencia ${data.grado} en "${ecuacion}".
        </div>
      </div>

      <div class="detalle">
        <span><strong>Linealidad:</strong> ${data.linealidad}</span>
        <button class="exp-btn" onclick="toggleExp('linealidad')">▼</button>
        <div id="exp-linealidad" class="exp oculto">
          ${data.linealidad === "Lineal"
            ? `Es lineal porque en "${ecuacion}" todas las derivadas aparecen solitas, sin multiplicarse ni elevarse.`
            : `Es no lineal porque en "${ecuacion}" hay potencias o productos de derivadas.`}
        </div>
      </div>

      <div class="detalle">
        <span><strong>Tipo:</strong> ${data.tipo}</span>
        <button class="exp-btn" onclick="toggleExp('tipo')">▼</button>
        <div id="exp-tipo" class="exp oculto">
          ${data.tipo === "Diferencial parcial"
            ? `Es diferencial parcial porque en "${ecuacion}" aparecen derivadas parciales (ej. u_x, du/dx, ∂).`
            : `Es diferencial ordinaria porque en "${ecuacion}" aparecen derivadas respecto a una sola variable (ej. y', y'').`}
        </div>
      </div>
    `;
  });
}

function toggleExp(id) {
  const exp = document.getElementById("exp-" + id);
  exp.classList.toggle("oculto");
}
