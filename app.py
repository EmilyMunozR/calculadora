from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

def calcular_grado(ecuacion):
    # Busca derivadas con exponentes, ej: (y')^3, (y'')^2, y'^4
    regex = r"\(y('{1,3})\)\^(\d+)|y('{1,3})\^(\d+)"
    matches = re.findall(regex, ecuacion)
    if matches:
        grados = []
        for m in matches:
            if m[1]:
                grados.append(int(m[1]))
            elif m[3]:
                grados.append(int(m[3]))
        return max(grados)
    return 1

def es_lineal(ecuacion):
    eq = ecuacion.replace(" ", "")
    # Potencias de y o derivadas
    if re.search(r"\(y('{1,3})\)\^\d+", eq) or re.search(r"y('{1,3})\^\d+", eq):
        return "No lineal"
    # Productos entre y y derivadas
    if re.search(r"(y('{1,3})?|y)\*(y('{1,3})?|y)", eq):
        return "No lineal"
    # Potencias de derivadas parciales
    if re.search(r"\(∂[a-zA-Z]+/∂[a-zA-Z]+\)\^\d+", eq):
        return "No lineal"
    return "Lineal"

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
    elif "∂^2" in ecuacion:
        orden = 2
    elif "∂" in ecuacion:
        orden = 1

    # --- GRADO ---
    grado = calcular_grado(ecuacion)

    # --- LINEALIDAD ---
    linealidad = es_lineal(ecuacion)

    # --- TIPO ---
    tipo = "Algebraica"
    if orden > 0:
        tipo = "Diferencial ordinaria"
    if "∂" in ecuacion:
        tipo = "Diferencial parcial"

    return jsonify({
        "orden": orden,
        "grado": grado,
        "linealidad": linealidad,
        "tipo": tipo
    })

if __name__ == "__main__":
    app.run(debug=True)
