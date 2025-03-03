import { Octokit } from 'npm:octokit@4.1.2'
import { $ } from 'jsr:@david/dax@0.42.0'
import { join, parse } from 'jsr:@std/path@1.0.8'
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Array, pipe } from 'jsr:@totto/function@0.1.3/effect'
import { downloadFromGitHub } from './download.ts'
import { printUsage } from './help.ts'
import { saveFile } from './save.ts'
import type { GitHubRepository } from './type.ts'

export async function main() {
  const tokenFromEnv = Deno.env.get('GITHUB_TOKEN')
  // TODO: オプションで指定できるようにする
  const limit = 10
  // TODO: 引数で指定できるようにする
  const repository = {
    owner: 'totto2727-org',
    repo: 'function',
    branch: 'main',
  } satisfies GitHubRepository

  // TODO: @effect/cliに置き換える
  if (Deno.args.includes('--help')) {
    printUsage()
    Deno.exit(0)
  }

  // TODO: @effect/cliに置き換える
  if (Deno.args.length !== 2) {
    console.error('Error: Exactly 2 arguments are required.')
    printUsage()
    Deno.exit(1)
  }

  // TODO: @effect/cliに置き換える
  const [targetPath, savingPath] = Deno.args

  console.log(`Downloading from: ${targetPath}`)
  console.log(`Saving to: ${savingPath}`)

  // TODO: Effectに置き換える
  try {
    const token =
      tokenFromEnv ??
      (await $`gh auth token`.printCommand(false).quiet().text())
    const octokit = new Octokit({
      auth: token,
    })
    const files = await downloadFromGitHub({
      octokit,
      repository,
      path: targetPath,
      option: { limit },
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
