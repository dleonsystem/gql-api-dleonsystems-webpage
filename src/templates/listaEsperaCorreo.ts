// templates/renderCorreo.ts
export function renderCorreoListaEspera(nombre: string, nombreEvento: string): string {
  const nombreSeguro = nombre.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' }[c]!));
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registro en Lista de Espera</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f6f6f6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .header {
      border-bottom: 4px solid #006341;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .header img {
      width: 160px;
    }
    .title {
      color: #006341;
      font-size: 20px;
      margin: 20px 0 10px;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ccc;
      margin-top: 30px;
      padding-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://framework-gb.cdn.gob.mx/landing/img/logoheader.svg" alt="Gobierno de México">
    </div>

    <div class="content">
      <h2 class="title">Registro en Lista de Espera</h2>
      <p>Estimada(o) <strong>${nombreSeguro}</strong>,</p>
      <p>Le informamos que su solicitud para asistir al evento <strong>${nombreEvento}</strong> ha sido registrada exitosamente en la <strong>lista de espera</strong>.</p>
      
      <p>Actualmente, el evento ha alcanzado su capacidad máxima de asistentes. Sin embargo, si se libera algún lugar, nos pondremos en contacto con usted a través del presente medio.</p>

      <p>Le agradecemos su interés y disposición por participar en las actividades organizadas por la Secretaría de Educación Pública.</p>

      <p>Si tiene alguna duda, puede escribirnos al correo <a href="mailto:cerrarlabrecha@sep.gob.mx">cerrarlabrecha@sep.gob.mx</a>.</p>
    </div>

    <div class="footer">
      Secretaría de Educación Pública · Dirección General de Política Educativa, Mejores Prácticas y Cooperación · México 2025
    </div>
  </div>
</body>
</html>

    `
    }   