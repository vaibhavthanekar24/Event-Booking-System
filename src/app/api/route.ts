import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'
import { getPayload } from '../../payload'

export const GET = REST_GET({ getPayload })
export const POST = REST_POST({ getPayload })
export const PUT = REST_PUT({ getPayload })
export const PATCH = REST_PATCH({ getPayload })
export const DELETE = REST_DELETE({ getPayload })
export const OPTIONS = REST_OPTIONS({ getPayload })