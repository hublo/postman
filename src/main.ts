import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<string> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspace: string = core.getInput('workspace-id')
    const collectionName: string = core.getInput('collection-name')
    const input: string = JSON.parse(core.getInput('openapi-json'))

    const collections = await getAllCollections(workspace, postmanApiKey)
    const collection = collections.find(
      (e: Collection) => e.name === collectionName
    )
    if (collection) {
      await deleteCollection(collection.id, postmanApiKey)
    }
    //await addCollection(input, workspace, postmanApiKey)

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
  await axios.post(
    'https://api.getpostman.com/import/openapi',
    {
      workspace,
      type: 'json',
      input
    },
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
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
