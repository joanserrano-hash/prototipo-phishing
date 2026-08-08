console.log("Extensión iniciada");

const boton = document.getElementById("btnVerificar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
    resultado.textContent = "Obteniendo página...";

    try {
        const pestañas = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        const pestaña = pestañas[0];

        if (!pestaña || !pestaña.url) {
            resultado.textContent = "No se pudo obtener la URL.";
            return;
        }

        resultado.textContent = `Página detectada:\n${pestaña.url}`;

        console.log("URL detectada:", pestaña.url);

    } catch (error) {
        console.error("Error al obtener la URL:", error);
        resultado.textContent = "Ocurrió un error al obtener la página.";
    }
});