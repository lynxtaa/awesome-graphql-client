/* eslint-disable no-console */
// Using undici will result in better performance.

import { File } from 'node:buffer'

import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { fetch, type RequestInit, type Response, FormData } from 'undici'

const client = new AwesomeGraphQLClient<string, RequestInit, Response>({
	endpoint: 'http://localhost:8080/graphql',
	fetch,
	FormData,
	isFileUpload: value => value instanceof File,
})

const UploadUserAvatar = `
  mutation uploadUserAvatar($userId: Int!, $file: Upload!) {
    updateUser(id: $userId, input: { avatar: $file }) {
      id
    }
  }
`

const data = await client.request(UploadUserAvatar, {
	file: new File(['test'], 'image.png'),
	userId: 10,
})

console.log(data.updateUser.id)
