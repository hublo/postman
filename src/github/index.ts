import {Octokit} from 'octokit'

export {getFileFromGithub}

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
