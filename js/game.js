document.addEventListener("DOMContentLoaded", function () {
    localStorage.removeItem("hasganado");
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        // Si no hay usuario, redirigir al login
        window.location.href = "../index.html"; // Redirige a login si no hay usuario autenticado
    }
    // Recuperar el nivel seleccionado del LocalStorage
    const nivelSeleccionado = localStorage.getItem("nivelSeleccionado");

    if (!nivelSeleccionado) {
        // Redirigir al login si no hay nivel seleccionado
        window.location.href = "../interfaces/bienvenida.html";
    }

    const canvas = document.getElementById("game");
    const context = canvas.getContext("2d");
    // context.shadowColor = "black";
    // context.shadowBlur = 15;

    const pelotaImagen = new Image();
    pelotaImagen.src = "../media/imagenes/bola.png"; // Carga la imagen de la bola
    const paletaImage = new Image();
    paletaImage.src = "../media/imagenes/padle.png"; // Carga la imagen del paleta
    const muroImagen = new Image();
    muroImagen.src = "../media/imagenes/muro.png"; // Carga la imagen del muro
    const paddleSound = new Audio("../media/sonido/impact.mp3");

    const ladrilloSeparacion = 2;
    const ladrilloAncho = 25;
    const ladrilloAlto = 12;
    const muroGrosor = 12;
    const ladrillosArray = [];

    // limites del canvas para luego verificar las colisiones con las paredes del cambas.
    // a la izquierda y en la parte superior el limite los lo marca el grosor del muro
    // abajo el limite el el alto del canvas, canvas.height, y a la derecha es el ancho del canvas - el grosor del muro

    const limites = {
        izquierda: muroGrosor,
        derecha: canvas.width - muroGrosor,
        superior: muroGrosor,
        inferior: canvas.height,
    };

    const mapaColores = {
        R: "red",
        O: "orange",
        G: "green",
        Y: "yellow",
    };

    const puntuacioColor = {
        R: 50, // Rojo - Puntuación alta
        O: 30, // Naranja - Puntuación media
        G: 20, // Verde - Puntuación baja
        Y: 10, // Amarillo - Puntuación mínima
    };

    let puntuacion = 0;
    let vidas = 3;

    // Variables para almacenar el patrón de las paredes
    let muroPattern = null;

    const nivel1 = [
        [],
        [],
        [],
        [],
        [],
        [],
        ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R"],
        ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R"],
        ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
        ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
        ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
        ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
        ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
        ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    ];

    const paleta = {
        x: canvas.width / 2 - ladrilloAncho,
        y: 440,
        width: 60, //  ajustar el tamaño de la imagen del paleta
        height: 15,
    };

    const bola = {
        x: 0,
        y: 0,
        width: 12, // Ajusta el tamaño de la bola si es necesario
        height: 12, // Ajusta el tamaño de la bola si es necesario
        speed: 0,
        dx: 0,
        dy: 0,
    };
    //console.log(bola);

    const cuadroIniciar = document.getElementById("informacion");
    const botonIniciar = document.getElementById("iniciarJuego");
    const musica = document.getElementById("musica"); // Obtener el elemento de audio

    // Una vez que la imagen esté cargada, crea el patrón
    muroImagen.onload = function () {
        muroPattern = context.createPattern(muroImagen, "repeat");
    };

    // Colisiones entre la pelota y las paredes
    // En un sistema de coordenadas de canvas, el eje x comienza en 0 en la parte izquierda y aumenta hacia la derecha
    // El eje y comienza en 0 en la parte superior y aumenta hacia abajo

    function verificarColisionesParedes() {
        if (bola.x < limites.izquierda) {
            bola.x = limites.izquierda;
            bola.dx *= -1; // Invierte la dirección horizontal de la bola, ahora irá hacia la izquierda bola.dx = -bola.dx;
        } else if (bola.x + bola.width > limites.derecha) {
            bola.x = limites.derecha - bola.width;
            bola.dx *= -1; // Invierte la dirección horizontal de la bola, ahora irá hacia la derecha
        }
        if (bola.y < limites.superior) {
            bola.y = limites.superior;
            bola.dy *= -1; // Invierte la dirección horizontal de la bola, ahora irá hacia la abajo
        }
        if (bola.y > limites.inferior) {
            vidas -= 1; // Resta una vida
            bola.dx = 0; // Detiene el movimiento horizontal
            bola.dy = 0; // Detiene el movimiento vertical
        }
    }

    // colisiones entre dos objetos
    function colisiones(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width && // El lado izquierdo de obj1 está a la izquierda del lado derecho de obj2
            obj1.x + obj1.width > obj2.x && // El lado derecho de obj1 está a la derecha del lado izquierdo de obj2
            obj1.y < obj2.y + obj2.height && // El lado superior de obj1 está por encima del lado inferior de obj2
            obj1.y + obj1.height > obj2.y // El lado inferior de obj1 está por debajo del lado superior de obj2
        );
    }

    //Colisiones entre la pelota y la paleta
    function verificarColisionesPaleta() {
        if (colisiones(bola, paleta)) {
            bola.dy *= -1; // Cambia la dirección vertical de la pelota
            bola.y = paleta.y - bola.height; // Asegura que la pelota esté encima de la paleta

            /* Efecto adicional: Cambia dirección horizontal según el punto de impacto
            si la pelota golpea más cerca de los bordes de la paleta, su trayectoria horizontal será más pronunciada, 
            lo que añade más dinamismo al juego y lo acerca mas al original */
            const puntoImpacto = bola.x + bola.width / 2 - (paleta.x + paleta.width / 2);
            const maxDesvio = paleta.width / 2;
            bola.dx += (puntoImpacto / maxDesvio) * 1.3; // Ajusta velocidad horizontal
            playPaddleSound();
        }
    }

    //Colisiones entre la pelota y los ladrillos
    function verificarColisionesLadrillos() {
        for (let i = 0; i < ladrillosArray.length; i++) {
            const ladrillo = ladrillosArray[i];
            if (colisiones(bola, ladrillo)) {
                puntuacion += ladrillo.puntuacion; // Incrementa la puntuación
                ladrillosArray.splice(i, 1); // Elimina el ladrillo del array
                // Determinar si la pelota choca en los lados verticales u horizontales del ladrillo
                if (
                    bola.y + bola.height - bola.speed <= ladrillo.y || // Parte superior del ladrillo
                    bola.y >= ladrillo.y + ladrillo.height - bola.speed // Parte inferior del ladrillo
                ) {
                    bola.dy *= -1; // Invierte la dirección vertical
                } else {
                    bola.dx *= -1; // Invierte la dirección horizontal
                }
                break; // Solo detecta una colisión a la vez
            }
        }
    }

    function playPaddleSound() {
        // Aseguramos que el sonido comience desde el inicio cada vez
        paddleSound.currentTime = 0;
        paddleSound.play().catch((error) =>
                console.error("Error al reproducir sonido:", error)
            );
    }
 
    // segun la dificulatad seleccionada pintamos el numero de bloques, velocidad de la bola y damos vidas
    switch (nivelSeleccionado) {
        case "principiante":
            nivel1.splice(6, 1);
            nivel1.splice(7, 1);
            nivel1.splice(8, 1);
            nivel1.splice(9, 1);
            bola.speed = 1.5;
            vidas = 5;
            break;
        case "intermedio":
            nivel1.splice(8, 2, [], []);
            bola.speed = 2.1;
            vidas = 3;
            break;
        case "avanzado":
            bola.speed = 2.4;
            vidas = 2;
            break;
        default:
            console.log("no se ha seleccionado nivel ");
            break;
    }

    // creamos el nivel de ladrillos, colores, puntuacion de cada ladrillo
    function crearnivel() {
        for (let row = 0; row < nivel1.length; row++) {
            for (let col = 0; col < nivel1[row].length; col++) {
                const colorCode = nivel1[row][col];
                ladrillosArray.push({
                    x: muroGrosor + (ladrilloAncho + ladrilloSeparacion) * col,
                    y: muroGrosor + (ladrilloAlto + ladrilloSeparacion) * row,
                    color: mapaColores[colorCode],
                    puntuacion: puntuacioColor[colorCode],
                    width: ladrilloAncho,
                    height: ladrilloAlto,
                });
            }
        }
    }

    crearnivel();
    //console.log(ladrillosArray);

    // dibujar los elementos del juego, paredes ladrillos bola paleta y marcadores

    function dibujarBorde() {
        context.fillStyle = muroPattern;
        context.fillRect(0, 0, canvas.width, muroGrosor); // Parte superior
        context.fillRect(0, 0, muroGrosor, canvas.height); // Borde izquierdo
        context.fillRect(canvas.width - muroGrosor, 0, muroGrosor, canvas.height); // Borde derecho
    }

    // dibujamos los ladrillos
    function dibujarLadrillos() {
        for (let ladrillo of ladrillosArray) {
            context.fillStyle = ladrillo.color;
            context.fillRect(ladrillo.x, ladrillo.y, ladrillo.width, ladrillo.height);
        }
    }

    // dibujamos los el marcador de puntos y vidas
    function dibujarMarcadores() {
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText("Puntos: " + puntuacion, muroGrosor + 10, 40);
        context.fillText("Vidas: " + vidas, canvas.width - 90, 40);
    }

    // dibujamos la paleta
    function dibujarPaleta() {
        context.drawImage(
            paletaImage,
            paleta.x,
            paleta.y,
            paleta.width,
            paleta.height
        );
    }

    // dibujamos la bola
    function dibujarBola() {
        context.drawImage(
            pelotaImagen,
            bola.x,
            bola.y,
            bola.width,
            bola.height
        );
    }

    // movimiento de la bola
    function movimientoBola() {
        bola.x += bola.dx;
        bola.y += bola.dy;
    }

    // Limpia el canvas evitando estelas y que se quede dibujado la bola y los elementos
    function limpiarCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height); 
    }

    // Actualizar posición de la bola, si no esta en movimiento que siga a la paleta encima de ella, en los saques
    function saqueBolaPaleta (){
        if (bola.dx === 0 && bola.dy === 0) {
            bola.x = paleta.x + paleta.width / 2 - bola.width / 2;
            bola.y = paleta.y - bola.height;
        }
    }
    
    // Función de animación
    function animacion() {
        
        // Limpia el canvas, para no crear estelas de la bola etc.
        limpiarCanvas()     
       
        // cuando la bola este detenida, la preparamos para el saque
        saqueBolaPaleta ()

        // movimiento de la bola
        movimientoBola();
    
        // Verificar colisiones con paredes, paleta y ladrillos
        verificarColisionesParedes();
        verificarColisionesPaleta();
        verificarColisionesLadrillos();
    
        // Dibujar elementos del juego
        dibujarBorde();
        dibujarLadrillos();
        dibujarPaleta();
        dibujarBola();
        dibujarMarcadores();

        /* 
        La funcion vuelve a llamarse a sí misma, y esto genera la animacion 
        requestAnimationFrame está diseñado para sincronizar la ejecución de animaciones 
        con la frecuencia de actualización del monitor, lo que mejora el rendimiento y la fluidez 
        de las animaciones en navegadores web. Sin embargo la velocidad de la bola va a depender de la frecuencia 
        de refresco de tu monitor por lo que podría ser que se mueva muy rapida o muy lenta dependiendo de tu pantalla
        Por programacion podriamos detectar la frecuencia del monitor y ajustarlo pero no me meto en esto.
        */
        requestAnimationFrame(animacion); 
    }
    
    // Iniciar la animación
    animacion();

    function controles() {
        // movemos la paleta con el mouse, La paleta se moverá con el ratón mientras permanezca dentro del área del canvas.
        canvas.addEventListener("mousemove", function (e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            paleta.x = mouseX - paleta.width / 2;

            if (paleta.x < muroGrosor) {
                paleta.x = muroGrosor;
            } else if (paleta.x + paleta.width > canvas.width - muroGrosor) {
                paleta.x = canvas.width - muroGrosor - paleta.width;
            }
        });

        // Lanza la pelota al hacer clic en el canvas
        canvas.addEventListener("click", function () {
            if (bola.dx === 0 && bola.dy === 0) {
                bola.dx = bola.speed;
                bola.dy = -bola.speed;
            }
        });
    }
  

    // Reproducir música cuando el usuario haga clic en el botón jugar e iniciar el juego
    botonIniciar.addEventListener("click", function () {
        musica.play().catch((error) => {
            console.log("El audio no se ha podido reproducir: ", error);
        });
        // ocultamos el boton y textos
        cuadroIniciar.style.display = "none";
        // Iniciar el juego
        juguemos();
    });

    // Función que inicia el juego, activa el temporizador y crea ciertos eventos durante el juego y lo finaliza
    function juguemos() {
        // activamos los controles de la paleta con el mouse y sacar con click del mouse
        controles();
        // Ahora, empieza el temporizador y el juego
        let tiempoRestante = 100;
        const tiempoElement = document.getElementById("tiempoRestante");

        const temporizador = setInterval(function () {
            tiempoRestante--;
            tiempoElement.textContent = tiempoRestante;

            // Cambiar el color del marcador si el tiempo es bajo, va cambiado de fondo con el tiempo
            if (tiempoRestante <= 100) {
                tiempoElement.classList.add("comienza");
            }
            if (tiempoRestante <= 93) {
            // cambiamos la imagen de fondo
                canvas.style.background =
                    "#000000 url('../media/imagenes/fondoespacio.jpg') no-repeat center center";
                canvas.style.backgroundSize = "cover";
                // a los 8 segundos del comienzo si nos has hecho click la bola saca automatico
                if (bola.dx === 0 && bola.dy === 0 && tiempoRestante > 92) {
                    bola.dx = bola.speed;
                    bola.dy = -bola.speed;
                }
            }
            if (tiempoRestante <= 78) {
                canvas.style.background =
                    "#000000 url('../media/imagenes/fondoespacio3.jpg') no-repeat center center";
                canvas.style.backgroundSize = "cover";
            }
            if (tiempoRestante <= 53) {
                canvas.style.background =
                    "#000000 url('../media/imagenes/fondoespacio2.jpg') no-repeat center center";
                canvas.style.backgroundSize = "cover";
            }
            if (tiempoRestante <= 29) {
                tiempoElement.classList.add("low-time");
                canvas.style.background =
                    "#000000 url('../media/imagenes/fondoespacio4.jpg') no-repeat center center";
                canvas.style.backgroundSize = "cover";
            } else {
                tiempoElement.classList.remove("low-time");
            }

            // Redirigir al resultados cuando se agote el tiempo, vidas a cero o no haya ladrilos...
            if (tiempoRestante <= 0 || ladrillosArray.length === 0 || vidas === 0 ) {
                cancelAnimationFrame(animacion);
                clearInterval(temporizador);
                localStorage.setItem("puntuacionFinal", puntuacion);
                if (ladrillosArray.length === 0) {
                    localStorage.setItem("hasganado", true);
                }
                window.location.href = "../interfaces/resultados.html";
            }
        }, 1000);
    }
});
