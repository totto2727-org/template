#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read

/**
 * GitHub Raw Downloader
 *
 * A simple Deno script to download files from GitHub raw URLs to a specified path.
 *
 * @example
 * ```bash
 * deno run --allow-net --allow-write --allow-read https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts <target-path> <destination-path>
 * deno run --allow-net --allow-write --allow-read https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts frontend .
 * // package.json, tsconfig.json, etc.
 * ```
 */

import { Octokit } from 'npm:octokit@4.1.2'
import { dirname, join, parse } from 'jsr:@std/path@1.0.8'
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Array, Match, Predicate, pipe } from 'jsr:@totto/function@0.1.3/effect'

type Repository = {
  owner: string
  repo: string
  branch: string
}

if (import.meta.main) {
  const repository = {
    owner: 'totto2727-org',
    repo: 'function',
    branch: 'main',
  } satisfies Repository

  if (Deno.args.includes('--help')) {
    printUsage()
    Deno.exit(0)
  }

  if (Deno.args.length !== 2) {
    console.error('Error: Exactly 2 arguments are required.')
    printUsage()
    Deno.exit(1)
  }
  const [targetPath, savingPath] = Deno.args

  console.log(`Downloading from: ${targetPath}`)
  console.log(`Saving to: ${savingPath}`)

  try {
    const octokit = new Octokit()
    const files = await recursiveDownloadFromGitHub({
      octokit,
      repository,
      path: targetPath,
    })

    const filesWithSavingPath = pipe(
      files,
      Array.map((v) => {
        const parsedPath = parse(v.path)
        const path = join(
          savingPath,
          join(
            v.path.replace(targetPath, ''),
            `${parsedPath.name}${parsedPath.ext}`,
          ),
        )
        return {
          ...v,
          path,
        }
      }),
    )

    await Promise.all(
      filesWithSavingPath.map((file) => saveFile(file.path, file.content)),
    )
    Deno.exit(0)
  } catch (error: unknown) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : JSON.stringify(error),
    )
    Deno.exit(1)
  }
}

type RecursiveDownloadFromGitHubArgs = {
  octokit: Octokit
  repository: Repository
  path: string
}

type RecursiveDownloadFromGitHubReturnType = Promise<
  {
    path: string
    content: string
  }[]
>

async function recursiveDownloadFromGitHub({
  octokit,
  repository,
  path,
}: RecursiveDownloadFromGitHubArgs): RecursiveDownloadFromGitHubReturnType {
  const response = await octokit.rest.repos.getContent({
    ...repository,
    ref: repository.branch,
    path,
  })

  if (response.status !== 200 || !response.data) {
    throw new Error(
      `Failed to get content: ${response.status} ${JSON.stringify(response.data)}`,
    )
  }

  if (
    Predicate.isString(response.data) &&
    response.data.includes('Request quota exhausted for request')
  ) {
    throw new Error('Rate limit exceeded')
  }

  const contentArray = Array.ensure(response.data)

  const matcher = Match.type<(typeof contentArray)[number]>().pipe(
    Match.when(
      (content) => content.type === 'file',
      (content): RecursiveDownloadFromGitHubReturnType => {
        return Promise.resolve([
          {
            path: content.path,
            content: atob(content.content ?? ''),
          },
        ])
      },
    ),
    Match.when(
      (content) => content.type === 'dir',
      (content): RecursiveDownloadFromGitHubReturnType => {
        return recursiveDownloadFromGitHub({
          octokit,
          repository,
          path: content.path,
        })
      },
    ),
    Match.orElseAbsurd,
  )

  const promises = await pipe(
    contentArray,
    Array.map((v) => matcher(v)),
    (v) => Promise.all(v),
  )

  return Array.flatten(promises)
}

async function saveFile(path: string, content: string) {
  await Deno.mkdir(dirname(path), { recursive: true })
  return await Deno.writeTextFile(path, content, {
    create: true,
  })
}

function printUsage(): void {
  console.log(
    `
GitHub Raw Downloader

A simple Deno script to download files from GitHub raw URLs to a specified path.

@example

\`\`\`bash
deno run --allow-net --allow-write --allow-read https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts <target-path> <destination-path>
deno run --allow-net --allow-write --allow-read https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts frontend .
// package.json, tsconfig.json, etc.
\`\`\`
`.trim(),
  )
}
