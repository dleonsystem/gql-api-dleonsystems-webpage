# gql-api-dleonsystems-webpage

API for the dleonsystems web page built with GraphQL.

## Available Scripts

- `npm run lint` – run ESLint on the TypeScript sources.

## Setup

1. Install dependencies:
    ```bash
    npm install
    ```
2. Copy the example environment file and adjust the values:
    ```bash
    cp .env.example .env
    ```
3. Build the project:
    ```bash
    npm run build
    ```
4. Start the server:
    ```bash
    npm start         # run compiled code
    npm run start:dev # watch mode with nodemon
    ```

## Logging

Logs are controlled by a `LOG_LEVEL` environment variable. Valid levels are
`error`, `warn`, `info` and `debug` (default is `info`).

## Running tests

Install dependencies and run the test suite using:

```bash
npm install
npm test
```

## Environment variables

Create a `.env` file based on `.env.example` and adjust the values as needed.

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
| `SMTP_PASS`             | SMTP server password.                      |
| `JSON_LIMIT`            | Max size accepted by `bodyParser.json`. Defaults to `20mb`. |
| `URLENCODED_LIMIT`      | Limit for `bodyParser.urlencoded`. Defaults to `50mb`.      |
| `LOG_LEVEL`             | Logging level (`error`, `warn`, `info`, `debug`).           |

Additional variables such as database or mail credentials may be required depending on your setup. Review the source code for the complete list.
