import _debug from 'debug'
import faunadb from 'faunadb'
// @ts-ignore
import fetch, { Headers } from './fetch-ponyfill.cjs'

const q = faunadb.query
const debug = (type: string) => _debug(`brainyduck-puke:${type}`)

export const endpoints = {
  import: 'https://graphql.us.fauna.com/import',
  server: 'https://graphql.us.fauna.com/graphql',
}

const loadSecret = () => {
  const secret = process.env.FAUNA_SECRET

  if (!secret) {
    console.error(
      `The fauna secret is missing! 🤷‍🥚\n\nPlease define a secret to get started. 💁🐣\n ↳ read more on https://github.com/zvictor/faugra/wiki/Fauna-secret\n`
    )

    throw new Error(`missing fauna's secret`)
  }

  return secret
}

const client = new faunadb.Client({
  secret: loadSecret(),
  domain: 'db.us.fauna.com',
})

export const createDatabase = (name: string) =>
  client.query(
    q.CreateKey({
      database: q.Select('ref', q.CreateDatabase({ name })),
      role: 'admin',
    })
  )

export const deleteInFauna = (ref: faunadb.Expr) => client.query(q.Delete(ref))

export const deleteDatabase = (name: string) => deleteInFauna(q.Database(name))

export const importSchema = async (schema: string, key?: string) => {
  debug('importSchema')(`Pushing the schema to ${endpoints.import}`)

  const response = await fetch(endpoints.import, {
    method: 'POST',
    body: schema,
    headers: new Headers({
      Authorization: `Bearer ${key || loadSecret()}`,
    }),
  })

  return await response.text()
}
