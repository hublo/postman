/* eslint-disable sort-imports */
import * as core from '@actions/core'
import {addCollection} from './add'
import {deleteCollection} from './delete'
import {getAllCollections} from './get'

import {Collection} from './types'

export {syncCollectionWithPostman}

async function syncCollectionWithPostman({
  filePath,
  workspace,
  postmanApiKey,
  jsonfileContent
}: {
  filePath: string
  workspace: string
  postmanApiKey: string
  jsonfileContent: string
}): Promise<string> {
  core.setOutput('filePath', filePath)
  const collectionName = getCollectionName(filePath)
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
}

function getCollectionName(filePath: string): string {
  const a = filePath.split('/')
  const fileName = a[a.length - 1]
  const a2 = fileName.split('.')
  return a2[0]
}
