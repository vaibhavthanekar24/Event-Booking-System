import { createNextPayloadHandler } from '@payloadcms/next'
import payload from '../../payload'

export const GET = createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})

export const POST = createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})

export const PUT = createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})

export const PATCH = createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})

export const DELETE = createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})