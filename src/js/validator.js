console.log("Validator cargado");

function normalizarDominio(dominio) {
    return dominio.trim().toLowerCase();
}

function normalizarDominio(dominio) {
    return dominio.trim().toLowerCase();
}

function obtenerHostname(valor) {
    try {
        const url = valor.startsWith("http")
            ? new URL(valor)
            : new URL(https://${valor});

        return normalizarDominio(url.hostname);

    } catch (error) {
        console.error("Error al obtener hostname:", error);
        return null;
    }
}

// Calcula la diferencia entre dos textos
function levenshtein(a, b) {
    const matriz = [];

    for (let i = 0; i <= b.length; i++) {
        matriz[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matriz[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {

            if (b[i - 1] === a[j - 1]) {
                matriz[i][j] = matriz[i - 1][j - 1];
            } else {
                matriz[i][j] = Math.min(
                    matriz[i - 1][j - 1] + 1,
                    matriz[i][j - 1] + 1,
                    matriz[i - 1][j] + 1
                );
            }
        }
    }

    return matriz[b.length][a.length];
}

// Regla 2
function esDominioSospechoso(dominio, dominioOficial) {

    const distancia = levenshtein(
        dominio.toLowerCase(),
        dominioOficial.toLowerCase()
    );

    return distancia > 0 && distancia <= 2;
}

function validarDominio(dominio, fuentes) {

    const dominioNormalizado = obtenerHostname(dominio);

    // Buscar dominio exacto
    const encontrado = fuentes.find(fuente =>
        normalizarDominio(fuente.dominio) === dominioNormalizado
    );

    if (encontrado) {
        return {
            estado: "valido",
            entidad: encontrado.entidad
        };
    }

    // Buscar dominio sospechoso
    const sospechoso = fuentes.find(fuente =>
        esDominioSospechoso(
            dominioNormalizado,
            normalizarDominio(fuente.dominio)
        )
    );

    if (sospechoso) {
        return {
            estado: "sospechoso",
            entidad: sospechoso.entidad
        };
    }

    return {
        estado: "desconocido",
        entidad: null
    };
}