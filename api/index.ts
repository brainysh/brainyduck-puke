import _debug from 'debug'
import RateLimiter from 'lambda-rate-limiter'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import puke from '../src/puke.js'

const debug = _debug('brainyduck-puke')
const rateLimit = RateLimiter({
  interval: 10 * 60000, // rate limit interval in ms, starts on first request
  uniqueTokenPerInterval: 50000, // excess causes earliest seen to drop, per instantiation
}).check

const readBody = async (request: VercelRequest): Promise<string> => {
  const buffers: any[] = []

  for await (const chunk of request) {
    buffers.push(chunk)
  }

  return Buffer.concat(buffers).toString()
}

export default async (request: VercelRequest, response: VercelResponse): Promise<void> => {
  const ip =
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.socket.remoteAddress

  try {
    if (ip) {
      await rateLimit(50, Array.isArray(ip) ? ip[0] : ip)
    }
  } catch (error) {
    response.status(429).send(`Too Many Requests`)
    return
  }

  const id = `${+new Date()}_${String(ip).replace(/[^\d\.]/gm, '') || Math.random()}`
  debug(`Request id: ${id}`)

  const payload = await readBody(request)
  debug(
    `Payload received${
      payload && payload.length ? ` [${payload.length} characters]` : ''
    }: ${payload}`
  )

  if (!payload) {
    response.status(400).send(`Payload must be sent`)
    return
  }

  if (payload.length > 10000) {
    response.status(413).send(`Payload Too Large`)
    return
  }

  try {
    response.status(200).send(await puke(id, payload))
  } catch (error) {
    response.status(500).send(error.message || error)
  }

  response.end()
}
