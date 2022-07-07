import debug from 'debug'
import fetch, { Headers, Request, Response } from 'node-fetch'

if (!globalThis.fetch) {
  debug('faugra:fetch')(`Native fetch not found. Using node-fetch`)

  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}
