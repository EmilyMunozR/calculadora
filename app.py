from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/clasificar", methods=["POST"])
def clasificar():
    ecuacion = request.json.get("ecuacion", "")

    # --- ORDEN ---
    orden = 0
    if "y'''" in ecuacion:
        orden = 3
    elif "y''" in ecuacion:
        orden = 2
    elif "y'" in ecuacion:
        orden = 1
    elif "∂" in ecuacion:
        orden = 1

    # --- GRADO ---
    grado = 1
    regex = r"(y'+|y''+|y'''+|∂[a-zA-Z]+/∂[a-zA-Z]+)\^(\d+)"
    matches = re.findall(regex, ecuacion)
    if matches:
        grados = [int(m[1]) for m in matches]
        grado = max(grados)

    # --- LINEALIDAD ---
    lineal = "Lineal"
    if "(y')^2" in ecuacion or "y*y'" in ecuacion or "(y'')^2" in ecuacion or "(y''')^2" in ecuacion:
        lineal = "No lineal"

    # --- TIPO ---
    tipo = "Algebraica"
    if orden > 0:
        tipo = "Diferencial ordinaria"
    if "∂" in ecuacion:
        tipo = "Diferencial parcial"

    return jsonify({
        "orden": orden,
        "grado": grado,
        "linealidad": lineal,
        "tipo": tipo
    })

if __name__ == "__main__":
    app.run(debug=True)
