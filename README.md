# gql-api-dleonsystems-webpage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and adjust the values:
   ```bash
   cp .env.example .env
   cp .env.example src/.env  # needed so constants load the variables
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start       # run compiled code
   npm run start:dev  # watch mode with nodemon
   ```

## Environment variables

| Variable                | Description                                |
|-------------------------|--------------------------------------------|
| `ELASTIC_EMAIL_API_KEY` | API key for Elastic Email service.         |
| `SECRET`                | Secret used to sign application tokens.    |
| `HOSTMYSQL`             | MySQL server host.                         |
| `USERMYSQL`             | MySQL user name.                           |
| `PASSWORDMYSQL`         | MySQL user password.                       |
| `DBMYSQL`               | MySQL database name.                       |
| `PORT`                  | Port where the API will run.               |
| `USRAPI`                | Username for the external REST API.        |
| `PASSWORDAPI`           | Password for the external REST API.        |
| `DURACIONTOKEN`         | JWT token lifetime in seconds.             |
| `JWT_SECRET`            | Secret key used by the auth middleware.    |
| `RECAPTCHA_PROJECT_ID`  | Google reCAPTCHA Enterprise project ID.    |
| `RECAPTCHA_SITE_KEY`    | Google reCAPTCHA site key.                 |
| `MAIL_API_URL`          | Endpoint of the mailing service API.       |
| `MAIL_USERNAME`         | User name for the mailing service API.     |
| `MAIL_PASSWORD`         | Password for the mailing service API.      |
| `SMTP_HOST`             | SMTP server host for nodemailer.           |
| `SMTP_PORT`             | SMTP server port.                          |
| `SMTP_USER`             | SMTP user account.                         |
| `SMTP_PASS`             | SMTP user password.                        |

