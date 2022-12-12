/* eslint-disable sort-imports */
import axios from 'axios'

import {Value} from './value'

export {addEnvironment}

async function addEnvironment(
  name: string,
  values: Value[],
  postmanApiKey: string
): Promise<void> {
  await axios.post(
    'https://api.getpostman.com/environments',
    {
      environment: {name, values}
    },
    {
      headers: {
        'x-api-key': postmanApiKey
      }
    }
  )
}
