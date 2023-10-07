import {readFileSync} from "node:fs"

export default function readJsonl<T>(file: string): T[] {
  return readFileSync(file, "utf-8")
    .split("\n")
    .filter((x) => x)
    .map((x) => JSON.parse(x))
}
