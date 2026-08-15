console.log("Extensión Alerta Digital iniciada");

const boton = document.getElementById("btnVerificar");
const resultado = document.getElementById("resultado");

function mostrarResultado(validacion) {
    resultado.className = "resultado";

    const clases = {
        confiable: "resultado--confiable",
        sospechoso: "resultado--sospechoso",
        no_verificable: "resultado--no-verificable",
        no_aplica: "resultado--no-aplica",
        error: "resultado--error"
    };

    resultado.classList.add(
        clases[validacion.estado] ?? "resultado--no-verificable"
    );

    const titulos = {
        confiable: "Sitio confiable",
        sospechoso: "Posible riesgo",
        no_verificable: "No verificable",
        no_aplica: "No aplica",
        error: "No fue posible analizar"
    };

    resultado.innerHTML = `
        <strong>${titulos[validacion.estado] ?? "Resultado"}</strong>
        <span>${validacion.mensaje}</span>
        ${validacion.dominio ? `<small>Dominio: ${validacion.dominio}</small>` : ""}
    `;
}

function esPaginaNoAplicable(url) {
    try {
        const protocolo = new URL(url).protocol.toLowerCase();

        return [
            "chrome:",
            "edge:",
            "about:",
            "file:",
            "chrome-extension:"
        ].includes(protocolo);
    } catch {
        return false;
    }
}

async function cargarFuentes() {
    const respuesta = await fetch("data/sources.json");

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar sources.json (${respuesta.status}).`);
    }

    return respuesta.json();
}

boton.addEventListener("click", async () => {
    boton.disabled = true;
    resultado.className = "resultado resultado--cargando";
    resultado.textContent = "Analizando página...";

    try {
        const pestañas = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        const pestaña = pestañas[0];

        if (!pestaña?.url) {
            mostrarResultado({
                estado: "error",
                dominio: null,
                mensaje: "No se pudo obtener la URL."
            });
            return;
        }

        if (esPaginaNoAplicable(pestaña.url)) {
            mostrarResultado({
                estado: "no_aplica",
                dominio: null,
                mensaje: "Esta página interna o local no puede evaluarse con este prototipo."
            });
            return;
        }

        const fuentes = await cargarFuentes();
        const validacion = validarDominio(pestaña.url, fuentes);

        mostrarResultado(validacion);

    } catch (error) {
        console.error("Error durante la validación:", error);

        mostrarResultado({
            estado: "error",
            dominio: null,
            mensaje: "Ocurrió un error durante el análisis. Intente nuevamente."
        });
    } finally {
        boton.disabled = false;
    }
});