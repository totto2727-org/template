export function printUsage(): void {
  console.log(
    `
GitHub Raw Downloader

A simple Deno script to download files from GitHub raw URLs to a specified path.

@example
\`\`\`bash
# use \`gh auth token\` to get GitHub's token
deno run -A https://raw.githubusercontent.com/totto2727-org/template/refs/heads/main/cli.ts <target-path> <destination-path>
deno run -A @totto/template/cli.ts <target-path> <destination-path>
\`\`\`

@example
\`\`\`bash
deno run -A @totto/template/cli.ts frontend .
// package.json, tsconfig.json, etc.
\`\`\`
`.trim(),
  )
}
