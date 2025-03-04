import config from '../deno.json' with { type: 'json' }

export function printUsage(): void {
  console.log(`Please refer to https://jsr.io/@totto/template@${config.version}`)
}
