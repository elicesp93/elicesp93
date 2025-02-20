document.addEventListener("DOMContentLoaded", function () {
    const fraseElemento = document.getElementById("frase");
    const mazo1 = document.querySelector(".mazo1");
    const mazo2 = document.querySelector(".mazo2");

    async function cargarFrases() {
        try {
            const response = await fetch("frases.json");
            return await response.json();
        } catch (error) {
            console.error("Error al cargar las frases:", error);
            return null;
        }
    }

    async function mostrarFrase(tipo) {
        const data = await cargarFrases();
        if (data) {
            const frases = tipo === "insight" ? data.insights : data.retos;
            const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
            fraseElemento.textContent = fraseAleatoria;
        }
    }

    mazo1.addEventListener("click", () => mostrarFrase("insight"));
    mazo2.addEventListener("click", () => mostrarFrase("reto"));
});
