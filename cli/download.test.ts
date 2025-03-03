import { expect } from 'jsr:@totto/function@0.1.3/test'
import { buildQuery } from './download.ts'
import { indentText } from './helper/indentText.ts'

Deno.test('buildQuery', async (t) => {
  await t.step('depth = 0', () => {
    expect(buildQuery(0)).toBe(
      indentText(`
query(owner: String, repo: String, $branchAndPath: String) {
  repository(owner: $owner, name: $repo) {
    object(expression: $branchAndPath) {
      ... on Blob {
        text
      }
    }
  }
}
`).trim(),
    )
  })

  await t.step('depth = 1', () => {
    expect(buildQuery(1)).toBe(
      indentText(`
query(owner: String, repo: String, $branchAndPath: String) {
  repository(owner: $owner, name: $repo) {
    object(expression: $branchAndPath) {
      ... on Blob {
        text
      }
      ... on Tree {
        entries {
          type
          path
          object {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
`).trim(),
    )
  })

  await t.step('depth = 2', () => {
    expect(buildQuery(2)).toBe(
      indentText(`
query(owner: String, repo: String, $branchAndPath: String) {
  repository(owner: $owner, name: $repo) {
    object(expression: $branchAndPath) {
      ... on Blob {
        text
      }
      ... on Tree {
        entries {
          type
          path
          object {
            ... on Blob {
              text
            }
            ... on Tree {
              entries {
                type
                path
                object {
                  ... on Blob {
                    text
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`).trim(),
    )
  })
})
