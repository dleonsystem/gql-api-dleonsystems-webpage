# gql-api-dleonsystems-webpage
GraphQL API for the dleonsystems webpage.

## Environment variables

Create a `.env` file based on `.env.example` and adjust the values as needed.

- `JSON_LIMIT` sets the maximum size accepted by `bodyParser.json`. Defaults to
  `20mb`.
- `URLENCODED_LIMIT` sets the limit for `bodyParser.urlencoded`. Defaults to
  `50mb`.

Additional variables such as database or mail credentials may be required
depending on your setup. Review the source code for the complete list.
