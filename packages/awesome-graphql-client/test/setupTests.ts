import { TextEncoder, TextDecoder } from 'node:util'

// eslint-disable-next-line unicorn/no-global-object-property-assignment
globalThis.TextEncoder = TextEncoder

// eslint-disable-next-line unicorn/no-global-object-property-assignment
globalThis.TextDecoder = TextDecoder
