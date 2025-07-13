# gql-api-dleonsystems-webpage

GraphQL API for the dleonsystems webpage.

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

- `JSON_LIMIT` sets the maximum size accepted by `bodyParser.json`. Defaults to `20mb`.
- `URLENCODED_LIMIT` sets the limit for `bodyParser.urlencoded`. Defaults to `50mb`.
- `JWT_SECRET` is required to sign and verify JSON Web Tokens.
- `LOG_LEVEL` controls the logging level (`error`, `warn`, `info`, `debug`).

Additional variables such as database or mail credentials may be required depending on your setup. Review the source code for the complete list.
