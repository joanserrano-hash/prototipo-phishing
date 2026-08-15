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
     // Se agrega la busque a los dominios de Sources, normalización de los dominios
        const url = new URL(pestaña.url);
        const dominio = url.hostname;
        const dominioNormalizado = dominio.replace(/^www\./, "");

        console.log("Dominio original:", dominio);
        console.log("Dominio normalizado:", dominioNormalizado);

        resultado.textContent = `Dominio detectado:\n${dominioNormalizado}`;

        console.log("URL detectada:", pestaña.url);
        console.log("Dominio detectado:", dominio);

        const respuesta = await fetch("data/sources.json");
        const fuentes = await respuesta.json();

         const fuenteEncontrada = fuentes.find(
         fuente => fuente.dominio === dominioNormalizado
         );

         if (fuenteEncontrada) {
         resultado.textContent =
          `Fuente verificada: ${fuenteEncontrada.entidad}`;
          } else {
          resultado.textContent =
         `Dominio no encontrado: ${dominioNormalizado}`;
         }
   
    } catch (error) {
        console.error("Error al obtener la URL:", error);
        resultado.textContent = "Ocurrió un error al obtener la página.";
    }
});

const validacion = validarDominio(
    pestana.url,
    fuentes
);

console.log(validacion);