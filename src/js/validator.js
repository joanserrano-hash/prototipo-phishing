function normalizarDominio(dominio) {
    if (!dominio) return "";

    return dominio
        .trim()
        .toLowerCase()
        .replace(/^www\./, "")
        .replace(/\.$/, "");
}


function normalizarParaComparacion(dominio) {
    return normalizarDominio(dominio)
        .replace(/-/g, "");
}


function obtenerHostname(valor) {
    try {
        const texto = String(valor ?? "").trim();

        if (!texto) {
            return null;
        }

        const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(texto)
            ? new URL(texto)
            : new URL(`https://${texto}`);

        return normalizarDominio(url.hostname);

    } catch (error) {
        console.error(
            "Error al obtener hostname:",
            error
        );

        return null;
    }
}


function levenshtein(a, b) {
    const textoA = String(a ?? "");
    const textoB = String(b ?? "");

    const matriz = Array.from(
        { length: textoB.length + 1 },
        () => Array(textoA.length + 1).fill(0)
    );

    for (let i = 0; i <= textoB.length; i++) {
        matriz[i][0] = i;
    }

    for (let j = 0; j <= textoA.length; j++) {
        matriz[0][j] = j;
    }

    for (let i = 1; i <= textoB.length; i++) {

        for (let j = 1; j <= textoA.length; j++) {

            const costo =
                textoB[i - 1] === textoA[j - 1]
                    ? 0
                    : 1;

            matriz[i][j] = Math.min(
                matriz[i - 1][j] + 1,
                matriz[i][j - 1] + 1,
                matriz[i - 1][j - 1] + costo
            );
        }
    }

    return matriz[textoB.length][textoA.length];
}


function perteneceADominioOficial(
    dominio,
    dominioOficial
) {
    return (
        dominio === dominioOficial ||
        dominio.endsWith(`.${dominioOficial}`)
    );
}


function contieneDominioOficialEnganoso(
    dominio,
    dominioOficial
) {
    return (
        dominio.includes(dominioOficial) &&
        !perteneceADominioOficial(
            dominio,
            dominioOficial
        )
    );
}


function esDominioSospechoso(
    dominio,
    dominioOficial
) {
    if (!dominio || !dominioOficial) {
        return false;
    }

    if (
        contieneDominioOficialEnganoso(
            dominio,
            dominioOficial
        )
    ) {
        return true;
    }

    const dominioComparacion =
        normalizarParaComparacion(dominio);

    const oficialComparacion =
        normalizarParaComparacion(dominioOficial);

    const distancia = levenshtein(
        dominioComparacion,
        oficialComparacion
    );

    return distancia > 0 && distancia <= 3;
}


function validarDominio(valor, fuentes) {

    const dominio = obtenerHostname(valor);

    if (!dominio) {
        return {
            estado: "error",
            entidad: null,
            dominio: null,
            mensaje:
                "No se pudo interpretar la dirección."
        };
    }


    const fuentesNormalizadas =
        (Array.isArray(fuentes) ? fuentes : [])
        .map((fuente) => ({
            ...fuente,
            dominioNormalizado:
                normalizarDominio(fuente.dominio)
        }));


    const oficial =
        fuentesNormalizadas.find((fuente) =>
            perteneceADominioOficial(
                dominio,
                fuente.dominioNormalizado
            )
        );


    if (oficial) {
        return {
            estado: "confiable",
            entidad: oficial.entidad,
            dominio,
            mensaje:
                `Esta página pertenece a una entidad verificada: ${oficial.entidad}`
        };
    }


    const sospechoso =
        fuentesNormalizadas.find((fuente) =>
            esDominioSospechoso(
                dominio,
                fuente.dominioNormalizado
            )
        );


    if (sospechoso) {
        return {
            estado: "sospechoso",
            entidad: sospechoso.entidad,
            dominio,
            mensaje:
                `Esta página puede no pertenecer al sitio oficial ${sospechoso.entidad}. Verifique antes de ingresar información personal.`
        };
    }


    return {
        estado: "no_verificable",
        entidad: null,
        dominio,
        mensaje:
            "No fue posible verificar esta página con nuestra información disponible. Tenga precaución."
    };
}