import { Directory, DirectoryID, Container } from "../../deps.ts";
import { Client } from "../../sdk/client.gen.ts";

export const getDirectory = async (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (src instanceof Directory) {
    return src;
  }
  if (typeof src === "string") {
    try {
      const directory = client.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return client.host
        ? client.host().directory(src)
        : client.currentModule().source().directory(src);
    }
  }
  return client.host
    ? client.host().directory(src)
    : client.currentModule().source().directory(src);
};

export function filterObjectByPrefix<T>(
  obj: Record<string, T>,
  prefix: string[]
): Record<string, T> {
  const filteredObject: Record<string, T> = {};

  for (const key in obj) {
    for (const p of prefix) {
      if (key.startsWith(p)) {
        filteredObject[key] = obj[key];
      }
    }
  }

  return filteredObject;
}

export function withEnvs(ctr: Container, envs: Record<string, string>) {
  for (const key in envs) {
    ctr = ctr.withEnvVariable(key, envs[key]);
  }
  return ctr;
}
