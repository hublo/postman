import * as core from '@actions/core'

import {Octokit} from 'octokit'

import axios from 'axios'

async function run(): Promise<string> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspace: string = core.getInput('workspace-id')
    const swaggerPath: string = core.getInput('swagger-path')
    const stringInput: string = core.getInput('openapi-json')
    const githubToken: string = core.getInput('githubToken')
    const githubRepo: string = core.getInput('githubRepo')
    const githubPath: string = core.getInput('githubPath')
    const githubOwner: string = core.getInput('githubOwner')

    const stringFileContent = await getStringFileContent({
      githubToken,
      githubOwner,
      githubRepo,
      githubPath,
      stringInput
    })

    const jsonfileContent = JSON.parse(stringFileContent)

    core.setOutput('swaggerPath', swaggerPath)
    const collectionName = getCollectionName(swaggerPath)
    core.setOutput('collectionName', collectionName)

    const collections = await getAllCollections(workspace, postmanApiKey)
    const collection = collections.find(
      (e: Collection) => e.name === collectionName
    )
    core.setOutput('collection', collection)
    if (collection) {
      await deleteCollection(collection.id, postmanApiKey)
    }
    await addCollection(jsonfileContent, workspace, postmanApiKey)

    return 'ok'
  } catch (error) {
    core.setOutput('error', error)
    if (error instanceof Error) core.setFailed(JSON.stringify(error))
    return 'not ok'
  }
}

async function getStringFileContent({
  githubToken,
  githubOwner,
  githubRepo,
  githubPath,
  stringInput
}: {
  githubToken: string
  githubOwner: string
  githubRepo: string
  githubPath: string
  stringInput?: string
}): Promise<string> {
  if (stringInput) {
    core.setOutput('stringInput', stringInput)
    return stringInput
  } else {
    let path = githubPath.startsWith('.') ? githubPath.substr(1) : githubPath
    path = path.startsWith('/') ? path.substr(1) : path
    core.setOutput('path', path)
    const fileContent = await getFileFromGithub({
      githubToken,
      owner: githubOwner,
      repo: githubRepo,
      path
    })
    core.setOutput('fileContent', fileContent)
    return fileContent
  }
}

function getCollectionName(swaggerPath: string): string {
  const a = swaggerPath.split('/')
  const fileName = a[a.length - 1]
  const a2 = fileName.split('.')
  return a2[0]
}

interface IGithubFile {
  content: string
}

async function getFileFromGithub({
  githubToken,
  owner,
  repo,
  path
}: {
  githubToken: string
  owner: string
  repo: string
  path: string
}): Promise<string> {
  const octokit = new Octokit({
    auth: githubToken
  })

  const result = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}{?ref}',
    {
      owner,
      repo,
      path
    }
  )
  const githubFile: IGithubFile = result.data
  return Buffer.from(githubFile.content, 'base64').toString('utf8')
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
