/* eslint-disable no-console */
/* eslint-disable unicorn/prefer-top-level-await */
// Using undici will result in better performance.
// Notice: it's experimental and only Node 16 is supported

import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { fetch, RequestInit, Response, FormData, File } from 'undici'

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

client
	.request(UploadUserAvatar, { file: new File(['test'], 'image.png'), userId: 10 })
	.then(data => console.log(data.updateUser.id))
	.catch(error => console.log(error))
