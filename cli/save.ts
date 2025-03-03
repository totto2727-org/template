import { dirname } from "jsr:@std/path@1.0.8/dirname";


export async function saveFile(path: string, content: string) {
  await Deno.mkdir(dirname(path), { recursive: true });
  return await Deno.writeTextFile(path, content, {
    create: true,
  });
}
