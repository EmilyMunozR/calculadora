@app.route("/clasificar", methods=["POST"])
def clasificar():
    ecuacion = request.json.get("ecuacion", "").strip()

    # --- Validación: ¿es diferencial?
    patrones = [
        r"y'", r"y''", r"y'''",
        r"∂", r"u_[a-z]+", r"d[a-zA-Z]+/d[a-zA-Z]+"
    ]
    es_diferencial = any(re.search(p, ecuacion) for p in patrones)

    if not es_diferencial:
        return jsonify({
            "error": "La expresión ingresada no es una ecuación diferencial."
        })

    # --- Si sí es diferencial, seguimos normal ---
    tipo = detectar_tipo(ecuacion)

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
