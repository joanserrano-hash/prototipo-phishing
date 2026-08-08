console.log("Extensión iniciada");

const boton = document.getElementById("btnVerificar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
    resultado.textContent = "Cargando fuentes...";

    try {
        const respuesta = await fetch("data/sources.json");
        const fuentes = await respuesta.json();

        resultado.textContent = `Fuentes cargadas: ${fuentes.length}`;
        console.log("Fuentes:", fuentes);
    } catch (error) {
        console.error("Error:", error);
        resultado.textContent = "No se pudieron cargar las fuentes.";
    }
});