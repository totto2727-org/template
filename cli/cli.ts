#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read

import { main } from './main.ts'

if (import.meta.main) {
  main()
}
