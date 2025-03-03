import type { Octokit } from 'npm:octokit@4.1.2'
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Array, Match, Record, pipe } from 'jsr:@totto/function@0.1.3/effect'
import { indentText } from './helper/indentText.ts'
import type { GitHubEntry, GitHubRepository, GitHubResponse } from './type.ts'
import type { DownloadedFile } from './type.ts'

type DownloadFromGitHubArgs = {
  octokit: Octokit
  repository: GitHubRepository
  path: string
  option: {
    depth: number
  }
}

type DownloadFromGitHubReturnType = Promise<
  {
    path: string
    content: string
  }[]
>

export async function downloadFromGitHub({
  octokit,
  repository,
  path,
  option: { depth },
}: DownloadFromGitHubArgs): DownloadFromGitHubReturnType {
  const branchAndPath = repository.branch
    ? `${repository.branch}:${path}`
    : path

  // TODO: バリデーション
  const response = await octokit.graphql<GitHubResponse>(buildQuery(depth), {
    owner: repository.owner,
    repo: repository.repo,
    branchAndPath,
  })

  // TODO: バリデーション
  if (
    Record.isEmptyRecord(response.repository.object as Record<string, unknown>)
  ) {
    return []
  }

  // TODO: バリデーション
  if (
    'text' in response.repository.object &&
    typeof response.repository.object.text === 'string'
  ) {
    const object = response.repository.object

    return [
      {
        path: path,
        content: object.text,
      },
    ]
  }

  // TODO: バリデーション
  if (
    'entries' in response.repository.object &&
    Array.isArray(response.repository.object.entries)
  ) {
    const entries = response.repository.object as {
      entries: GitHubEntry[]
    }

    return flattenGitHubEntry(entries.entries)
  }

  throw new Error(`Unknown response: ${JSON.stringify(response)}`)
}

export function flattenGitHubEntry(entries: GitHubEntry[]): DownloadedFile[] {
  const entryMatcher = Match.type<GitHubEntry>().pipe(
    Match.discriminator('type')('blob', (v) => [
      { path: v.path, content: v.object.text },
    ]),
    Match.discriminator('type')('tree', (v) =>
      flattenGitHubEntry(v.object.entries),
    ),
    Match.orElseAbsurd,
  )

  return pipe(
    entries,
    Array.map((v) => entryMatcher(v)),
    Array.flatten,
  )
}

export function buildQuery(depth: number): string {
  return indentText(
    `
query($owner: String!, $repo: String!, $branchAndPath: String!) {
  repository(owner: $owner, name: $repo) {
    object(expression: $branchAndPath) {
${buildQuery_(depth)}
    }
  }
}
`.trim(),
  )
}

function buildQuery_(depth: number): string {
  if (depth <= 0) {
    return `
... on Blob {
  text
}
`.trim()
  }

  return `
... on Blob {
  text
}
... on Tree {
  entries {
    type
    path
    object {
${buildQuery_(depth - 1)}
    }
  }
}
`.trim()
}
