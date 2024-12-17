// Asegurarnos de que el DOM está completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', function () {
        
    // A diferencia de sessionStorage, los datos en localStorage persisten incluso después de cerrar el navegador  
    // Al cargar la página, cargar datos JSON en LocalStorage (esto debe ejecutarse en index.html)

    async function cargarUsuarios() {
        try {
            // Carga el archivo JSON
            const response = await fetch('../data/usuarios.json');             
            const usuarios = await response.json(); 
            
            //console.log(usuarios); // array de objetos
            //console.log(typeof usuarios); // objet
            
            //Para guardar objetos en localStoraje, primero convertimos el objeto en a string JSON con JSON.stringify() 
            const usuariosCadena = JSON.stringify(usuarios);
            //console.log(usuariosCadena);
            //console.log(typeof usuariosCadena); // string

            // localStorage.setItem(identificador, content)
            // Guardamos en LocalStorage el string, con identificador 'usuarios'
            localStorage.setItem('usuarios', usuariosCadena); 
        
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
        }
    }
    
    
    cargarUsuarios();
   

    // Validar usuario y contraseña introducidos en el formulario
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        const usuarioInput = document.getElementById('usuario').value;
        const passwordInput = document.getElementById('contraseña').value;


        // Validar si la contraseña cumple el formato con la funcion .test()
        // ^ y $: La cadena completa debe coincidir con el patrón
        // [a-zA-Z0-9]: Solo puede contener letras mayúsculas, minúsculas o números.
        // +: Debe tener al menos un carácter.
        const contraseñaValida = /^[a-zA-Z0-9]+$/.test(passwordInput);
        if (!contraseñaValida) {
            mostrarMensaje("La contraseña debe contener solo caracteres alfanuméricos.");
            return;
        }
        
        // Recuperar usuarios del LocalStorage
        // localStorage siempre almacena los valores como cadenas de texto
        
        const usuariosString= localStorage.getItem("usuarios");
        if (!usuariosString) {
            mostrarMensaje("No hay usuarios disponibles. Intente recargar la página.");
            return;
        }

        // No puedes acceder a propiedades de una cadena '[{"nombre":"Juan"},{"nombre":"Ana"}]'
        // JSON.parse: Convierte la cadena recuperada de localStorage a su forma original un objeto
        // localStorage.getItem(identificador, content)
        const usuarios = JSON.parse(usuariosString); 

        // Buscar si existe el usuario con la contraseña
        const usuarioValido = usuarios.find(
            usuario => usuario.usuario === usuarioInput && usuario.contraseña === passwordInput
        );

        if (usuarioValido) {
            // Guardo el usuario en localStorage luego lo mostrare en las interfaces siguientes
            localStorage.setItem('usuario', JSON.stringify({ usuario: usuarioInput }));
            // Redirigir a la interfaz de bienvenida
            window.location.href = "../interfaces/bienvenida.html"; 
        } else {
            mostrarMensaje("Usuario o contraseña incorrectos.");
        }

    });

    // Función para mostrar mensajes
    function mostrarMensaje(texto) {
        const mensaje = document.getElementById('mensaje');
        mensaje.textContent = texto;
        mensaje.style.color = "red";
    }

});