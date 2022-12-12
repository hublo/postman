/* eslint-disable sort-imports */
import * as core from '@actions/core'
import {addEnvironment} from './add'
import {deleteEnvironment} from './delete'
import {getAllEnvironments} from './get'
import {Environment} from './types'
import {getValues, JsonfileContent} from './value'

export {syncEnvironmentWithPostman}

async function syncEnvironmentWithPostman({
  filePath,
  workspace,
  postmanApiKey,
  jsonfileContent,
  postmanEnvSecrets
}: {
  filePath: string
  workspace: string
  postmanApiKey: string
  jsonfileContent: unknown
  postmanEnvSecrets: Object
}): Promise<string> {
  core.setOutput('filePath', filePath)
  const environmentName = getEnvironmentName(filePath)
  core.setOutput('environmentName', environmentName)

  const values = getValues(
    jsonfileContent as JsonfileContent,
    postmanEnvSecrets
  )
  const environments = await getAllEnvironments(workspace, postmanApiKey)
  const environment = environments.find(
    (e: Environment) => e.name === environmentName
  )
  core.setOutput('environment', environment)
  if (environment) {
    await deleteEnvironment(environment.id, postmanApiKey)
  }
  await addEnvironment(environmentName, values, postmanApiKey)

  return 'ok'
}

function getEnvironmentName(filePath: string): string {
  const a = filePath.split('/')
  const fileName = a[a.length - 1]
  const a2 = fileName.split('.')
  return a2[0]
}
