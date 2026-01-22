from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

def calcular_grado(ecuacion):
    regex = r"\(y('{1,3})\)\^(\d+)|y('{1,3})\^(\d+)|\(u_[a-z]+\)\^(\d+)|u_[a-z]+\^(\d+)"
    matches = re.findall(regex, ecuacion)
    if matches:
        grados = []
        for m in matches:
            for val in m:
                if val.isdigit():
                    grados.append(int(val))
        return max(grados)
    return 1

def es_lineal(ecuacion):
    eq = ecuacion.replace(" ", "")
    if re.search(r"\(y('{1,3})\)\^\d+", eq) or re.search(r"y('{1,3})\^\d+", eq):
        return "No lineal"
    if re.search(r"(y('{1,3})?|y)\*(y('{1,3})?|y)", eq):
        return "No lineal"
    if re.search(r"\(u_[a-z]+\)\^\d+", eq) or re.search(r"u_[a-z]+\^\d+", eq):
        return "No lineal"
    return "Lineal"

def detectar_tipo(ecuacion):
    eq = ecuacion.replace(" ", "")
    if re.search(r"u_[a-z]+", eq):
        return "Diferencial parcial"
    if re.search(r"d[a-zA-Z]+/d[a-zA-Z]+", eq):
        return "Diferencial parcial"
    if "∂" in eq:
        return "Diferencial parcial"
    if "y'" in eq or "y''" in eq or "y'''" in eq:
        return "Diferencial ordinaria"
    return "No es una ecuación diferencial"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/clasificar", methods=["POST"])
def clasificar():
    ecuacion = request.json.get("ecuacion", "")

    tipo = detectar_tipo(ecuacion)

    if tipo == "No es una ecuación diferencial":
        return jsonify({
            "error": "La expresión ingresada no es una ecuación diferencial."
        })

    orden = 0
    if "y'''" in ecuacion:
        orden = 3
    elif "y''" in ecuacion or "u_xx" in ecuacion or "u_yy" in ecuacion or "u_tt" in ecuacion or "u_xy" in ecuacion:
        orden = 2
    elif "y'" in ecuacion or "u_x" in ecuacion or "u_y" in ecuacion or "du/dx" in ecuacion or "du/dy" in ecuacion:
        orden = 1
    elif "∂^2" in ecuacion:
        orden = 2
    elif "∂" in ecuacion:
        orden = 1

    grado = calcular_grado(ecuacion)
    linealidad = es_lineal(ecuacion)

    return jsonify({
        "orden": orden,
        "grado": grado,
        "linealidad": linealidad,
        "tipo": tipo
    })

if __name__ == "__main__":
    app.run(debug=True)
