document.addEventListener('DOMContentLoaded', function () {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        // Si no hay usuario, redirigir al login
        window.location.href = "../index.html"; // Redirige a login si no hay usuario autenticado
    }
    // Obtener elementos del DOM
    const botonReiniciar = document.getElementById('reiniciarJuego');
    const botonSalir = document.getElementById('salirLogin');

    // Acción para Reiniciar el Juego
    botonReiniciar.addEventListener('click', function () {
        // Redirigir a la interfaz de bienvenida
        window.location.href = "../interfaces/bienvenida.html";
    });

    // Acción para Salir al Login
    botonSalir.addEventListener('click', function () {
        // Limpiar datos del LocalStorage para reiniciar el flujo completo
        localStorage.removeItem('usuario');
        localStorage.removeItem('nivelSeleccionado');
        // Redirigir a la interfaz de login
        window.location.href = "../index.html";
    });

    // Mostrar los resultados finales (si se guardaron en LocalStorage)
    const puntuacionFinal = localStorage.getItem('puntuacionFinal') || 0;
    const textoVictoria = localStorage.getItem('hasganado') || 0;
    const usuarioobjeto = JSON.parse(usuario);
    document.getElementById('user-nombre').textContent = usuarioobjeto.usuario;

    document.getElementById('puntuacionFinal').textContent = puntuacionFinal;
    if (textoVictoria){
        document.getElementById('game-over').textContent = "VICTORIA!!!";
    }
   
});