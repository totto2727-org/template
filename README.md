# GitHub Raw Downloader

A simple Deno script to download files from GitHub repositories to a specified path.

## Requirements

This tool requires a `GITHUB_TOKEN` to access the GitHub GraphQL API.

### Authentication Options

#### Option 1: Using `gh auth token`

You can use the token obtained from the GitHub CLI after running `gh auth login`.
This is the simplest method if you're already logged in via the GitHub CLI.

```bash
deno run -A jsr:@totto/template/cli <owner> <repo> <target-path> <destination-path>
```

#### Option 2: Using `GITHUB_TOKEN` environment variable

Alternatively, you can set the `GITHUB_TOKEN` environment variable directly.
This is particularly useful for CI/CD environments like GitHub Actions.

```bash
GITHUB_TOKEN=<your-github-token> deno run -A jsr:@totto/template/cli <owner> <repo> <target-path> <destination-path>
```

## Example

To download the frontend directory from the totto2727-org/template repository to your current directory:

```bash
deno run -A jsr:@totto/template/cli totto2727-org template frontend .
```

## Options

### `--depth`

Default: `10`

The depth of the directory to download.

If the depth is 0, the specified file will be downloaded.
If the depth is 0 and the specified path is a directory, nothing will be downloaded.

### `--branch`

Default: The default branch of the target repository

The branch to download from.

### `--help`

Show help information.
