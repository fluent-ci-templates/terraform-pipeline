import { Directory, DirectoryID, Container } from "../../deps.ts";
import { Client } from "../../sdk/client.gen.ts";

export const getDirectory = (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (typeof src === "string" && src.startsWith("core.Directory")) {
    return client.directory({
      id: src as DirectoryID,
    });
  }
  return src instanceof Directory ? src : client.host().directory(src);
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
