/* eslint-disable no-shadow */
/* eslint-disable sort-imports */
import * as core from '@actions/core'
import {syncCollectionWithPostman} from './postman/collection/sync'

import {getFileFromGithub} from './github'
import {syncEnvironmentWithPostman} from './postman/environment/sync'

enum SyncPostman {
  collection = 'collection',
  environment = 'environment'
}

async function run(): Promise<void> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspace: string = core.getInput('workspace-id')
    const githubToken: string = core.getInput('githubToken')
    const githubRepo: string = core.getInput('githubRepo')
    const githubPath: string = core.getInput('githubPath')
    const githubOwner: string = core.getInput('githubOwner')
    const sync: string = core.getInput('sync')
    const postmanEnvSecret1: string = core.getInput('postmanEnvSecret1')
    const postmanEnvSecrets = {
      postmanEnvSecret1
    }

    core.setOutput('workspace', workspace)

    const stringFileContent = await getStringFileContent({
      githubToken,
      githubOwner,
      githubRepo,
      githubPath
    })
    const jsonfileContent = JSON.parse(stringFileContent)

    if (sync === SyncPostman.collection) {
      await syncCollectionWithPostman({
        githubPath,
        workspace,
        postmanApiKey,
        jsonfileContent
      })
    } else if (sync === SyncPostman.environment) {
      await syncEnvironmentWithPostman({
        githubPath,
        workspace,
        postmanApiKey,
        jsonfileContent,
        postmanEnvSecrets
      })
    }
  } catch (error) {
    core.setOutput('error', error)
    if (error instanceof Error) core.setFailed(JSON.stringify(error))
  }
}

async function getStringFileContent({
  githubToken,
  githubOwner,
  githubRepo,
  githubPath
}: {
  githubToken: string
  githubOwner: string
  githubRepo: string
  githubPath: string
}): Promise<string> {
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

run()
