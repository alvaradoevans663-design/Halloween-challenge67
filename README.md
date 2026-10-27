# 🎃 Halloween Challenge

Página web para una competencia de retos durante una salida de Halloween. Los participantes completan 9 retos y el primero en ser validado en cada uno gana un punto.

## Cómo se usa

1. Pulsa **COMENZAR** y escribe tu nombre o apodo.
2. Avanza con **Siguiente reto** o toca los números para ver retos anteriores y pendientes.
3. Pulsa **Iniciar cronómetro** al empezar un reto. Al terminarlo, adjunta una foto y pulsa **Completar reto**: el tiempo queda registrado.
4. El organizador entra en **Modo organizador** (la primera vez crea un PIN), revisa las pruebas y pulsa **Validar** o **Rechazar**.
5. El primero validado en cada reto se lleva el punto. Un participante solo puede enviar una prueba por reto.
6. Cuando los 9 retos tienen ganador (o el organizador pulsa **Finalizar**), se muestra al campeón.

## Ejecutar en local

No necesita instalar nada: abre `index.html` en tu navegador.
Opcional, con servidor local: `python3 -m http.server 8000` y visita `http://localhost:8000`.

## Subir a GitHub

1. Crea un repositorio nuevo en github.com (por ejemplo `halloween-challenge`).
2. Sube `index.html`, `style.css`, `script.js` y `README.md` (con **Add file → Upload files**, o con git):
   ```
   git init
   git add .
   git commit -m "Halloween Challenge"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/halloween-challenge.git
   git push -u origin main
   ```

## Activar GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment*, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. Guarda. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/halloween-challenge/`.

## Limitaciones

- **Los datos NO se comparten entre dispositivos.** Todo se guarda en el `localStorage` del navegador. El teléfono de cada niño tendrá su propia copia y su propia clasificación.
- La forma de usarlo tal cual es **un solo dispositivo** compartido (por ejemplo, el del organizador), donde cada participante elige su nombre y el organizador valida allí mismo.
- Las fotos se reducen y se guardan en el navegador, que tiene unos 5 MB de espacio. Borrar los datos del sitio borra la partida.
- El PIN del organizador está en el navegador y solo evita pulsaciones accidentales; no es seguridad real.
- Para compartir puntuaciones en tiempo real entre móviles haría falta un servicio externo gratuito (por ejemplo Firebase o Supabase) y modificar `script.js` para leer y escribir allí. **Esta versión no lo incluye**, y no hay ninguna clave en el código.

## Personalizar

- El cronómetro lo controla cada jugador (el organizador ve el tiempo al validar y puede rechazar tiempos dudosos). La clasificación desempata por menor tiempo total en los retos ganados, y cada reto muestra su mejor tiempo validado.
- Retos: arreglo `RETOS` al inicio de `script.js`.
- Colores: variables `:root` en `style.css`.
