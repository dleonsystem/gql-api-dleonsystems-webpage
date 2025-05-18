// templates/renderCorreo.ts
export function renderCorreoRegistro(nombre: string, nombreEvento: string, fechaEvento: string, horaEvento:string, lugarEvento: string, enlaceEvento: string): string {
  const nombreSeguro = nombre.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' }[c]!));
  return `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Registro</title>
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
    .button {
      display: inline-block;
      background-color: #006341;
      color: white;
      padding: 12px 20px;
      margin-top: 25px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
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
      <h2 class="title">Confirmación de Registro</h2>
      <p>Estimada(o) <strong>${nombreSeguro}</strong>,</p>
      <p>Gracias por registrarse al evento <strong>${nombreEvento}</strong> organizado por la Secretaría de Educación Pública.</p>
      <p>Le confirmamos que su registro ha sido exitosamente procesado.</p>
      
      <p><strong>Detalles del evento:</strong></p>
      <ul>
        <li><strong>Fecha:</strong> ${fechaEvento}</li>
        <li><strong>Hora:</strong> ${horaEvento}</li>
        <li><strong>Lugar:</strong> ${lugarEvento}</li>
      </ul>

      <p>Le recomendamos llegar 15 minutos antes del inicio para completar su registro de entrada. En caso de requerir apoyo adicional, puede contactarnos al correo <a href="mailto:eventos@sep.gob.mx">eventos@sep.gob.mx</a>.</p>

      <a class="button" href="${enlaceEvento}">Ver Detalles del Evento</a>
    </div>

    <div class="footer">
      Secretaría de Educación Pública · Dirección General de Política Educativa, Mejores Prácticas y Cooperación · México 2025
    </div>
  </div>
</body>
</html>
`;
}
