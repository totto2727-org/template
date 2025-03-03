#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read

/**
 * GitHub Raw Downloader
 *
 * A simple Deno script to download files from GitHub raw URLs to a specified path.
 *
 * @example
 * ```bash
 * # use `gh auth token` to get GitHub's token
 * deno run -A https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts <owner> <repo> <target-path> <destination-path>
 * deno run -A jsr:@totto/template/cli <owner> <repo> <target-path> <destination-path>
 * ```
 *
 * @example
 * ```bash
 * deno run -A jsr:@totto/template/cli totto2727-org template frontend .
 * // package.json, tsconfig.json, etc.
 * ```
 */

import { main } from './main.ts'

if (import.meta.main) {
  main()
}
