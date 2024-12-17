document.addEventListener('DOMContentLoaded', function () {
    // Verificar si el usuario está autenticado
    const usuario = localStorage.getItem('usuario');
    console.log(usuario);
    if (!usuario) {
        // Si no hay usuario, redirigir al login
        window.location.href = "../index.html"; // Redirige a login si no hay usuario autenticado
    } else {
        // sacamos el usuario en la interfaz de bienvenida
        const usuarioobjeto = JSON.parse(usuario);
        document.getElementById('user-nombre').textContent = usuarioobjeto.usuario;
    }
    
    // Selecciona el botón y la sección de instrucciones
    const btnMostrar = document.getElementById('mostrarInstrucciones');
    const instrucciones = document.getElementById('instrucciones');

    // Agrega un evento al botón para mostrar/ocultar instrucciones
    btnMostrar.addEventListener('click', () => {
        // Alterna la clase 'mostrar' para desplegar u ocultar las instrucciones
        if (instrucciones.classList.contains('mostrar')) {
            instrucciones.classList.remove('mostrar'); // Oculta
            btnMostrar.textContent = '¿No sabes cómo Jugar?: haz clic aquí'; // Cambia el texto del botón
        } else {
            instrucciones.classList.add('mostrar'); // Muestra
            btnMostrar.textContent = 'Ocultar Instrucciones'; // Cambia el texto del botón
        }
    });

    // guardar la seleccion de nivel
    if (document.title === "Bienvenida - Juego") {
        document.getElementById('comenzarJuego').addEventListener('click', function () {
            const nivelSeleccionado = document.getElementById('nivel').value;

            // Guardar el nivel seleccionado en LocalStorage
            localStorage.setItem('nivelSeleccionado', nivelSeleccionado);

            // Redirigir al juego
            window.location.href = "../interfaces/juego.html";
        });
    }
});