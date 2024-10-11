<div align="center">
  <a href="https://github.com/lynxtaa/awesome-graphql-client">
    <img width="180" height="180" src="logo.svg" alt="Logo">
  </a>
  <br>
  <br>
  <img alt="CI/CD" src="https://github.com/lynxtaa/awesome-graphql-client/workflows/CI/CD/badge.svg">
  <a href="https://badge.fury.io/js/awesome-graphql-client">
    <img alt="npm version" src="https://badge.fury.io/js/awesome-graphql-client.svg">
  </a>
  <a href="https://codecov.io/gh/lynxtaa/awesome-graphql-client" alt="npm version">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/lynxtaa/awesome-graphql-client">
  </a>
  <br>
  <br>
  <h1>Awesome GraphQL Client</h1>
  <p>GraphQL Client with file upload support for NodeJS and browser</p>
</div>

## Features

- [GraphQL File Upload](https://github.com/jaydenseric/graphql-multipart-request-spec) support
- Works in browsers and NodeJS
- Zero dependencies
- Small size (around 2Kb gzipped)
- Full Typescript support
- Supports queries generated by [graphql-tag](https://www.npmjs.com/package/graphql-tag)
- Supports GraphQL GET requests
- Supports partial response
- Perfect for React apps in combination with [react-query](https://www.npmjs.com/package/react-query). See [Next.js example](https://github.com/lynxtaa/awesome-graphql-client/tree/master/examples/next-js)

## Install

```sh
npm install awesome-graphql-client
```

## Quick Start

### Browser

```js
import { AwesomeGraphQLClient } from 'awesome-graphql-client'

const client = new AwesomeGraphQLClient({ endpoint: '/graphql' })

// Also query can be an output from graphql-tag (see examples below)
const GetUsers = `
  query getUsers {
    users {
      id
    }
  }
`

const UploadUserAvatar = `
  mutation uploadUserAvatar($userId: Int!, $file: Upload!) {
    updateUser(id: $userId, input: { avatar: $file }) {
      id
    }
  }
`

client
  .request(GetUsers)
  .then(data =>
    client.request(UploadUserAvatar, {
      id: data.users[0].id,
      file: document.querySelector('input#avatar').files[0],
    }),
  )
  .then(data => console.log(data.updateUser.id))
  .catch(error => console.log(error))
```

### NodeJS

#### NodeJS 20

```js
const { openAsBlob } = require('node:fs')
const { AwesomeGraphQLClient } = require('awesome-graphql-client')

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:8080/graphql',
})

// Also query can be an output from graphql-tag (see examples below)
const UploadUserAvatar = `
  mutation uploadUserAvatar($userId: Int!, $file: Upload!) {
    updateUser(id: $userId, input: { avatar: $file }) {
      id
    }
  }
`

const blob = await openAsBlob('./avatar.png')

client
  .request(UploadUserAvatar, { file: new File([blob], 'avatar.png'), userId: 10 })
  .then(data => console.log(data.updateUser.id))
  .catch(error => console.log(error))
```

#### NodeJS 18

```js
const { createReadStream, statSync } = require('node:fs')
const path = require('node:path')
const { Readable } = require('node:stream')
const { AwesomeGraphQLClient } = require('awesome-graphql-client')

class StreamableFile extends Blob {
  constructor(filePath) {
    const { mtime, size } = statSync(filePath)

    super([])

    this.name = path.parse(filePath).base
    this.lastModified = mtime.getTime()
    this.#filePath = filePath

    Object.defineProperty(this, 'size', {
      value: size,
      writable: false,
    })
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'File',
      writable: false,
    })
  }

  stream() {
    return Readable.toWeb(createReadStream(this.#filePath))
  }
}

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:8080/graphql',
})

// Also query can be an output from graphql-tag (see examples below)
const UploadUserAvatar = `
  mutation uploadUserAvatar($userId: Int!, $file: Upload!) {
    updateUser(id: $userId, input: { avatar: $file }) {
      id
    }
  }
`

client
  .request(UploadUserAvatar, { file: new StreamableFile('./avatar.png'), userId: 10 })
  .then(data => console.log(data.updateUser.id))
  .catch(error => console.log(error))
```

## Table of Contents

- API
  - [AwesomeGraphQLClient](#awesomegraphqlclient)
  - [GraphQLRequestError](#graphqlrequesterror)
  - [gql](#approach-2-use-fake-graphql-tag)
  - [isFileUpload](#custom-isfileupload-predicate)
- Examples
  - [Typescript](#typescript)
  - [Error Logging](#error-logging)
  - [GraphQL GET Requests](#graphql-get-requests)
  - [GraphQL Tag](#graphql-tag)
  - [Cookies in NodeJS](#cookies-in-nodejs)
  - [Custom _isFileUpload_ Predicate](#custom-isfileupload-predicate)
  - [More Examples](#more-examples)

## API

## `AwesomeGraphQLClient`

**Usage**:

```js
import { AwesomeGraphQLClient } from 'awesome-graphql-client'
const client = new AwesomeGraphQLClient(config)
```

### `config` properties

- `endpoint`: _string_ - The URL to your GraphQL endpoint (required)
- `fetch`: _Function_ - Fetch polyfill
- `fetchOptions`: _object_ - Overrides for fetch options
- `FormData`: _object_ - FormData polyfill
- `formatQuery`: _function(query: any): string_ - Custom query formatter (see [example](#graphql-tag))
- `onError`: _function(error: GraphQLRequestError | Error): void_ - Provided callback will be called before throwing an error (see [example](#error-logging))
- `isFileUpload`: _function(value: unknown): boolean_ - Custom predicate function for checking if value is a file (see [example](#custom-isfileupload-predicate))

### `client` methods

- `client.setFetchOptions(fetchOptions: FetchOptions)`: Sets fetch options. See examples below
- `client.getFetchOptions()`: Returns current fetch options
- `client.setEndpoint(): string`: Sets a new GraphQL endpoint
- `client.getEndpoint(): string`: Returns current GraphQL endpoint
- `client.request(query, variables?, fetchOptions?): Promise<data>`: Sends GraphQL Request and returns data or throws an error
- `client.requestSafe(query, variables?, fetchOptions?): Promise<{ data, response } | { error }>`: Sends GraphQL Request and returns object with 'ok: true', 'data' and 'response' or with 'ok: false' and 'error' fields. See examples below. _Notice: this function never throws_.

## `GraphQLRequestError`

### `instance` fields

- `message`: _string_ - Error message
- `query`: _string_ - GraphQL query
- `variables`: _string | undefined_ - GraphQL variables
- `response`: _Response_ - response returned from fetch

## Examples

## Typescript

```ts
interface getUser {
  user: { id: number; login: string } | null
}
interface getUserVariables {
  id: number
}

const query = `
  query getUser($id: Int!) {
    user {
      id
      login
    }
  }
`

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:3000/graphql',
})

client
  .request<getUser, getUserVariables>(query, { id: 10 })
  .then(data => console.log(data))
  .catch(error => console.log(error))

client.requestSafe<getUser, getUserVariables>(query, { id: 10 }).then(result => {
  if (!result.ok) {
    throw result.error
  }
  console.log(`Status ${result.response.status}`, `Data ${result.data.user}`)
})
```

### Typescript with TypedDocumentNode (even better!)

You can generate types from queries by using [GraphQL Code Generator](https://www.graphql-code-generator.com/) with [TypedDocumentNode plugin](https://github.com/dotansimha/graphql-typed-document-node)

```graphql
# queries.graphql
query getUser($id: Int!) {
  user {
    id
    login
  }
}
```

```ts
// index.ts
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { print } from 'graphql/language/printer'

import { GetCharactersDocument } from './generated'

const gqlClient = new AwesomeGraphQLClient({
  endpoint: 'https://rickandmortyapi.com/graphql',
  formatQuery: (query: TypedDocumentNode) => print(query),
})

// AwesomeGraphQLClient will infer all types from the passed query automagically:
gqlClient
  .request(GetCharactersDocument, { name: 'Rick' })
  .then(data => console.log(data))
  .catch(error => console.log(error))
```

Check out full example at [examples/typed-document-node](https://github.com/lynxtaa/awesome-graphql-client/tree/master/examples/typed-document-node)

## Error Logging

```js
import { AwesomeGraphQLClient, GraphQLRequestError } from 'awesome-graphql-client'

const client = new AwesomeGraphQLClient({
  endpoint: '/graphql',
  onError(error) {
    if (error instanceof GraphQLRequestError) {
      console.error(error.message)
      console.groupCollapsed('Operation:')
      console.log({ query: error.query, variables: error.variables })
      console.groupEnd()
    } else {
      console.error(error)
    }
  },
})
```

## GraphQL GET Requests

Internally it uses [URLSearchParams API](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams). Consider [polyfilling URL standard](https://github.com/zloirock/core-js#url-and-urlsearchparams) for this feature to work in IE

```js
client
  .request(query, variables, { method: 'GET' })
  .then(data => console.log(data))
  .catch(err => console.log(err))
```

## GraphQL Tag

### Approach #1: Use `formatQuery`

```ts
import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { DocumentNode } from 'graphql/language/ast'
import { print } from 'graphql/language/printer'
import gql from 'graphql-tag'

const client = new AwesomeGraphQLClient({
  endpoint: '/graphql',
  formatQuery: (query: DocumentNode | string) =>
    typeof query === 'string' ? query : print(query),
})

const query = gql`
  query me {
    me {
      login
    }
  }
`

client
  .request(query)
  .then(data => console.log(data))
  .catch(err => console.log(err))
```

### Approach #2: Use fake `graphql-tag`

Recommended approach if you're using `graphql-tag` only for syntax highlighting and static analysis such as linting and types generation. It has less computational cost and makes overall smaller bundles. GraphQL fragments are supported too.

```js
import { AwesomeGraphQLClient, gql } from 'awesome-graphql-client'

const client = new AwesomeGraphQLClient({ endpoint: '/graphql' })

const query = gql`
  query me {
    me {
      login
    }
  }
`

client
  .request(query)
  .then(data => console.log(data))
  .catch(err => console.log(err))
```

### Approach #3: Use TypedDocumentNode instead

Perfect for Typescript projects. See [example above](#typescript-with-typeddocumentnode-even-better)

## Cookies in NodeJS

```js
const { AwesomeGraphQLClient } = require('awesome-graphql-client')
const fetchCookie = require('fetch-cookie')

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:8080/graphql',
  fetch: fetchCookie(globalThis.fetch),
})
```

## Custom _isFileUpload_ Predicate

```js
const { AwesomeGraphQLClient, isFileUpload } = require('awesome-graphql-client')

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:8080/graphql',
  // By default File, Blob, Buffer, Promise and stream-like instances are considered as files.
  // You can expand this behaviour by adding a custom predicate
  isFileUpload: value => isFileUpload(value) || value instanceof MyCustomFile,
})
```

## Partial response

See also

- https://spec.graphql.org/October2021/#sec-Errors.Field-errors
- https://spec.graphql.org/October2021/#sec-Errors.Error-result-format

```js
const { AwesomeGraphQLClient } = require('awesome-graphql-client')

const client = new AwesomeGraphQLClient({
  endpoint: 'http://localhost:8080/graphql',
  fetchOptions: {
    allowPartialData: true,
  },
})
```

## More Examples

[https://github.com/lynxtaa/awesome-graphql-client/tree/master/examples](https://github.com/lynxtaa/awesome-graphql-client/tree/master/examples)
