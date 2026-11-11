# DYCK Awards 2026

Sitio web interactivo para los DYCK Awards 2026. Interfaz móvil profesional, votación con puntos 5-3-1 y panel de administración.

## Cómo usar

### 1. Configuración inicial (como administrador)

1. Abre `index.html` en tu navegador.
2. Pulsa el botón **Admin** (abajo a la derecha).
3. Introduce la contraseña: `dyck2026`
4. Añade las categorías.
5. Añade los nominados (máximo 15 en total). Para las fotos:
   - Sube las fotos a [Imgur](https://imgur.com) o similar.
   - Copia la URL directa de la imagen y pégala en el campo.

### 2. Compartir con amigos

- Sube los archivos (`index.html`, `styles.css`, `app.js`, `logo.jpg`, `trophy.jpg`) a un hosting gratuito:
  - **Netlify Drop**: Arrastra la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop)
  - **Vercel**
  - **GitHub Pages**
  - O cualquier servidor web.

### 3. Votar

- Los amigos abren la web, escriben su nombre y votan.
- En cada categoría seleccionan 1º (5 puntos), 2º (3 puntos) y 3º (1 punto).

### 4. Ver resultados

Solo el administrador (con la contraseña) puede ver:
- Clasificación general por puntos
- Quién ha votado qué exactamente

## Importante

Esta versión usa **localStorage** del navegador. Eso significa:

- Los datos se guardan solo en el dispositivo donde se configuran.
- **No es multi-dispositivo por defecto**.

### Para hacerlo realmente compartible entre varios dispositivos:

Tienes dos opciones fáciles:

**Opción A - Firebase (recomendada)**
1. Crea un proyecto gratuito en [Firebase](https://firebase.google.com)
2. Activa Firestore
3. Sustituye las funciones de `localStorage` por llamadas a Firestore
4. (Puedo ayudarte a adaptarlo si me das la configuración)

**Opción B - Google Apps Script + Google Sheets**
Puedo generarte el código para que todo se guarde en una hoja de cálculo de Google y lo despliegues como aplicación web gratuita.

---

**Contraseña por defecto:** `dyck2026`  
(Cámbiala en la línea 2 de `app.js`)

¡Que gane el mejor! 🏆