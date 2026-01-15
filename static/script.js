function insertar(texto) {
  let input = document.getElementById("ecuacion");
  let start = input.selectionStart || input.value.length;
  let end = input.selectionEnd || input.value.length;
  let current = input.value;
  input.value = current.substring(0, start) + texto + current.substring(end);
  input.selectionStart = input.selectionEnd = start + texto.length;
  input.focus();
}

function borrar() {
  let input = document.getElementById("ecuacion");
  let start = input.selectionStart || input.value.length;
  let end = input.selectionEnd || input.value.length;
  if (start === end && start > 0) {
    input.value = input.value.substring(0, start - 1) + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start - 1;
  } else {
    input.value = input.value.substring(0, start) + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start;
  }
  input.focus();
}

function clasificar() {
  let ecuacion = document.getElementById("ecuacion").value;

  fetch("/clasificar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ecuacion: ecuacion})
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("resultado").innerHTML = `
      <p><strong>Orden:</strong> ${data.orden}</p>
      <p><strong>Grado:</strong> ${data.grado}</p>
      <p><strong>Linealidad:</strong> ${data.linealidad}</p>
      <p><strong>Tipo:</strong> ${data.tipo}</p>
      <button class="btn-small" onclick="toggleDetalles()">Ver más</button>
      <div id="detalles" class="detalles oculto">
        <p><strong>Orden:</strong> ${data.orden} porque la derivada más alta es de orden ${data.orden}.</p>
        <p><strong>Grado:</strong> ${data.grado} porque la derivada aparece elevada a la potencia ${data.grado}.</p>
        <p><strong>Linealidad:</strong> ${data.linealidad} porque ${data.linealidad === "Lineal" ? "las derivadas y la función aparecen solitas, sin multiplicarse ni elevarse." : "hay productos o potencias de y o sus derivadas."}</p>
        <p><strong>Tipo:</strong> ${data.tipo} porque ${data.tipo === "Diferencial parcial" ? "aparecen derivadas parciales (∂)." : "las derivadas son respecto a una sola variable."}</p>
      </div>
    `;
  });
}

function toggleDetalles() {
  let detalles = document.getElementById("detalles");
  detalles.classList.toggle("oculto");
}
