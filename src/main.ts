import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<string> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspaceId: string = core.getInput('workspace-id')
    const collectionName: string = core.getInput('collection-name')
    const input: string = core.getInput('openapi-json')

    core.debug(new Date().toTimeString())
    core.debug(new Date().toTimeString())

    const data = {
      workspace: workspaceId,
      type: 'json',
      input
    }

    await axios.post('https://api.getpostman.com/import/openapi', data, {
      headers: {
        'x-api-key': postmanApiKey
      }
    })

    core.setOutput('time', new Date().toTimeString())

    return 'ok'
  } catch (error) {
    if (error instanceof Error) core.setFailed('error')
    return 'not ok'
  }
}

run()
