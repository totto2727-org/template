import { Octokit } from 'npm:octokit@4.1.2'
import { $ } from 'jsr:@david/dax@0.42.0'
import { parseArgs } from 'jsr:@std/cli@1.0.13/parse-args'
import { resolve } from 'jsr:@std/path@1'
import { Array, pipe } from 'jsr:@totto/function@0.1.3/effect'
import { downloadFromGitHub } from './download.ts'
import { printUsage } from './help.ts'
import { saveFile } from './save.ts'
import type { GitHubRepository } from './type.ts'

export async function main() {
  const tokenFromEnv = Deno.env.get('GITHUB_TOKEN')

  // TODO: @effect/cliに置き換える
  const { depth = '10', branch, help, _ } = parseArgs(Deno.args)

  if (help) {
    printUsage()
    Deno.exit(0)
  }

  if (_.length !== 4) {
    console.error('Error: Exactly 4 arguments are required.')
    printUsage()
    Deno.exit(1)
  }

  const [owner_, repo_, targetPath_, savingPath_] = _

  const owner = owner_.toString()
  const repo = repo_.toString()
  const targetPath = targetPath_.toString()
  const savingPath = resolve(savingPath_.toString())

  const repository = {
    owner,
    repo,
    branch,
  } satisfies GitHubRepository

  console.log(`Downloading from: ${targetPath}`)
  console.log(`Saving to: ${savingPath}`)

  // TODO: Effectに置き換える
  try {
    const token = tokenFromEnv ?? (await $`gh auth token`.printCommand(false).quiet().text())
    const octokit = new Octokit({
      auth: token,
    })
    const files = await downloadFromGitHub({
      octokit,
      repository,
      path: targetPath,
      option: { depth },
    })

    const filesWithSavingPath = pipe(
      files,
      Array.map((v) => {
        return {
          ...v,
          path: v.path.replace(targetPath, savingPath),
        }
      }),
    )

    await Promise.all(filesWithSavingPath.map((file) => saveFile(file.path, file.content)))
    Deno.exit(0)
  } catch (error: unknown) {
    console.error('Error:', error instanceof Error ? error.message : JSON.stringify(error))
    Deno.exit(1)
  }
}
