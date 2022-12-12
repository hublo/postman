import axios from 'axios'

export {deleteCollection}
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
