export type DownloadedFile = {
  path: string
  content: string
}

export type GitHubRepository = {
  owner: string
  repo: string
  branch?: string
}

type GitHubFile = {
  path: string
  type: 'blob'
  object: {
    text: string
  }
}

type GitHubDirectory = {
  path: string
  type: 'tree'
  object: {
    entries: (GitHubFile | GitHubDirectory)[]
  }
}

export type GitHubEntry = GitHubFile | GitHubDirectory

export type GitHubResponse = {
  repository: {
    object: // biome-ignore lint/complexity/noBannedTypes: <explanation>
      | {}
      | {
          text: string
        }
      | {
          entries: GitHubEntry[]
        }
  }
}
