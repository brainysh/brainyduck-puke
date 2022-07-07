import _debug from 'debug'
import { importSchema, endpoints, createDatabase, deleteInFauna, deleteDatabase } from './fauna'
import { getRemoteSchema } from './graphql'

const debug = _debug('brainyduck-puke:puke')

export default async (id: string, payload: string) => {
  const { ref, secret } = (await createDatabase(id)) as any
  debug(`Database ${id} created`)

  const result = await importSchema(payload, secret)
  debug(result)

  const schema = await getRemoteSchema(endpoints.server, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  })
  debug(`Schema puked [${schema.length} characters]`)

  await deleteDatabase(id)
  debug(`Database ${id} deleted`)

  await deleteInFauna(ref)
  debug(`Key ${ref} deleted`)

  return schema
}
