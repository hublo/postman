import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<string> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspace: string = core.getInput('workspace-id')
    const collectionName: string = core.getInput('collection-name')
    const input: string = JSON.parse(core.getInput('openapi-json'))

    const collections = await getAllCollections(workspace, postmanApiKey)
    core.info('Output to the actions build log')
    core.debug('Output to the actions build log')
    core.info(`${collections.length}`)
    const collection = collections.find(
      (e: Collection) => e.name === collectionName
    )
    core.setOutput('collection', collection)
    if (collection) {
      // await deleteCollection(collection.id, postmanApiKey)
    }
    await addCollection(input, workspace, postmanApiKey)

    core.setFailed(JSON.stringify(input))
    return 'ok'
  } catch (error) {
    if (error instanceof Error) core.setFailed(JSON.stringify(error))
    return 'not ok'
  }
}

async function addCollection(
  input: string,
  workspace: string,
  postmanApiKey: string
): Promise<void> {
  const result = await axios.post(
    'https://api.getpostman.com/import/openapi',
    {
      workspace,
      type: 'json',
      input: {
        openapi: '3.0.0',
        info: {
          version: '1.0.0',
          title: 'Test API'
        },
        servers: [
          {
            url: 'http://locahost:3000'
          }
        ],
        paths: {
          '/user': {
            get: {
              summary: 'List all users',
              operationId: 'listUser',
              parameters: [
                {
                  name: 'id',
                  in: 'query',
                  required: true,
                  description: "The user'''s ID.",
                  example: 1234,
                  schema: {
                    type: 'integer',
                    format: 'int32'
                  }
                }
              ],
              responses: {
                '200': {
                  description: 'Information about the user.',
                  headers: {
                    'x-next': {
                      description: 'A link to the next page of responses.',
                      schema: {
                        type: 'string'
                      }
                    }
                  },
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64'
                },
                name: {
                  type: 'string'
                },
                tag: {
                  type: 'string'
                }
              }
            },
            Error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'integer',
                  format: 'int32'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )

  core.setOutput('result', result)
}

async function deleteCollection(
  collectionId: string,
  postmanApiKey: string
): Promise<void> {
  await axios.delete(`https://api.getpostman.com/collections/${collectionId}`, {
    headers: {
      'x-api-key': postmanApiKey
    }
  })
}

interface Collection {
  id: string
  name: string
}
async function getAllCollections(
  workspace: string,
  postmanApiKey: string
): Promise<Collection[]> {
  const response = await axios.get(
    `https://api.getpostman.com/collections?workspace=${workspace}`,
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
  return response.data.collections
}

run()
