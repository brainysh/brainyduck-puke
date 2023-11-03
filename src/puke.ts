import './fetch-polyfill.cjs'
import _debug from 'debug'
import { importSchema, endpoints, createDatabase, deleteInFauna, deleteDatabase } from './fauna.js'
import { getRemoteSchema } from './graphql.js'

const debug = _debug('brainyduck-puke:puke')

const sponsor = (schema: string) => `
"""


💸    ---    This schema was generated in the cloud at the expense of the Brainyduck maintainers.   ---    📉
😇    ---    Please be kind and consider donating to the Brainyduck project if you find it useful.  ---    😇
🐥🙏   --                 The DUCK needs your help to spread his word to the world!                  --   🙏🐥

                                          https://duck.brainy.sh
                                    https://github.com/sponsors/zvictor

🌟💎🎆                     THIS SPACE IS AVAILABLE FOR ADVERTISING AND SPONSORSHIP!                     🎆💎🌟


"""

${schema}
`

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

  return sponsor(schema)
}
