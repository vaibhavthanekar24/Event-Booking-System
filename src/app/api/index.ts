import { createNextPayloadHandler } from '@payloadcms/next'
import payload from '../../payload'

export default createNextPayloadHandler({
  payload,
  options: {
    generateNextApiEndpoint: true,
  },
})