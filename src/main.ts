import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspaceId: string = core.getInput('workspace-id')
    const collectionName: string = core.getInput('collection-name')
    const openapiJson: string = core.getInput('openapi-json')

    core.debug(new Date().toTimeString())
    core.debug(new Date().toTimeString())

    const data = {
      workspace: workspaceId,
      type: 'json',
      input: openapiJson
    }
    await axios({
      method: 'post',
      url: 'https://api.getpostman.com/import/openapi',
      headers: {
        'x-api-key': postmanApiKey
      },
      data
    })

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
