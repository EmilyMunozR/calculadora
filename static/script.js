function insertar(texto) {
  let input = document.getElementById("ecuacion");
  input.value += texto;
}

function borrar() {
  let input = document.getElementById("ecuacion");
  input.value = input.value.slice(0, -1);
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
