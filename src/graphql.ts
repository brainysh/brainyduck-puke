// The code in this file has been copied from https://github.com/prisma-labs/get-graphql-schema/blob/2e8732322ba52158aa6bb163de3d7107a041cc52/src/index.ts

import { introspectionQuery } from 'graphql/utilities/introspectionQuery'
import { buildClientSchema } from 'graphql/utilities/buildClientSchema'
import { printSchema } from 'graphql/utilities/schemaPrinter'

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: { [key: string]: string }
  json?: boolean
}

/**
 *
 * Fetch remote schema and turn it into string
 *
 * @param endpoint
 * @param options
 */
export async function getRemoteSchema(endpoint: string, options: Options = {}): Promise<string> {
  //@ts-ignore
  const { data, errors } = await fetch(endpoint, {
    ...options,
    body: JSON.stringify({ query: introspectionQuery }),
  }).then((res) => res.json())

  if (errors) {
    throw new Error(JSON.stringify(errors, null, 2))
  }

  if (options.json) {
    return JSON.stringify(data, null, 2)
  } else {
    const schema = buildClientSchema(data)
    return printSchema(schema)
  }
}
