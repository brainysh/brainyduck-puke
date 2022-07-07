import _debug from 'debug'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import puke from '../src/puke'

const debug = _debug('brainyduck-puke')

const readBody = async (request: VercelRequest): Promise<string> => {
  const buffers: any[] = []

  for await (const chunk of request) {
    buffers.push(chunk)
  }

  return Buffer.concat(buffers).toString()
}

export default async (request: VercelRequest, response: VercelResponse): Promise<void> => {
  const id = `${+new Date()}_${
    String(request.headers['x-forwarded-for'] || request.socket.remoteAddress).replace(
      /[^\d\.]/gm,
      ''
    ) || Math.random()
  }`
  debug(`Request id: ${id}`)

  const payload = await readBody(request)
  debug('Payload received: %o', payload)

  if (!payload) {
    response.status(400).send(`Payload must be sent`)
    return
  }

  response.status(200).send(await puke(id, payload))
  response.end()
}
