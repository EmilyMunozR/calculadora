function insertar(texto) {
  let input = document.getElementById("ecuacion");
  // Inserta texto en la posición actual del cursor
  let start = input.selectionStart;
  let end = input.selectionEnd;
  let current = input.value;
  input.value = current.substring(0, start) + texto + current.substring(end);
  // Mueve el cursor al final del texto insertado
  input.selectionStart = input.selectionEnd = start + texto.length;
  input.focus();
}

function borrar() {
  let input = document.getElementById("ecuacion");
  let start = input.selectionStart;
  let end = input.selectionEnd;
  if (start === end && start > 0) {
    // borra un carácter antes del cursor
    input.value = input.value.substring(0, start - 1) + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start - 1;
  } else {
    // borra selección
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
    `;
  });
}
