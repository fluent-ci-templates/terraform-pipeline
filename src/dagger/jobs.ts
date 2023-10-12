import { client } from "./dagger.ts";
import { filterObjectByPrefix, withEnvs } from "./lib.ts";

export enum Job {
  init = "init",
  validate = "validate",
  plan = "plan",
  apply = "apply",
}

export const exclude = [".terraform", ".git", ".fluentci", "plan"];

const envs = filterObjectByPrefix(Deno.env.toObject(), [
  "TF_",
  "AWS_",
  "GOOGLE_",
]);

export const init = async (
  src = ".",
  googleApplicationCredentials?: string
) => {
  const context = client.host().directory(src);
  const TF_VERSION = Deno.env.get("TF_VERSION") || "latest";
  if (googleApplicationCredentials) {
    Deno.env.set(
      "GOOGLE_APPLICATION_CREDENTIALS",
      googleApplicationCredentials
    );
  }

  const baseCtr = withEnvs(
    client
      .pipeline(Job.init)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", client.cacheVolume("terraform"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["version"])
    .withExec(["init"]);

  const result = await ctr.stdout();

  return result;
};

export const validate = async (src = ".") => {
  const context = client.host().directory(src);
  const TF_VERSION = Deno.env.get("TF_VERSION") || "latest";

  const baseCtr = withEnvs(
    client
      .pipeline(Job.validate)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", client.cacheVolume("terraform"))
    .withDirectory("/app", context, {
      exclude,
    })
    .withWorkdir("/app")
    .withExec(["version"])
    .withExec(["validate"]);

  const result = await ctr.stdout();

  return result;
};

export const plan = async (
  src = ".",
  googleApplicationCredentials?: string
) => {
  const context = client.host().directory(src);
  const TF_VERSION = Deno.env.get("TF_VERSION") || "latest";

  if (googleApplicationCredentials) {
    envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
  }

  const baseCtr = withEnvs(
    client
      .pipeline(Job.plan)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", client.cacheVolume("terraform"))
    .withMountedCache("/app/plan", client.cacheVolume("tfplan"))
    .withDirectory("/app", context, {
      exclude,
    })
    .withWorkdir("/app")
    .withExec(["version"])
    .withExec(["plan", "-out=/app/plan/plan.tfplan"]);

  const result = await ctr.stdout();

  return result;
};

export const apply = async (
  src = ".",
  googleApplicationCredentials?: string
) => {
  const context = client.host().directory(src);
  const TF_VERSION = Deno.env.get("TF_VERSION") || "latest";

  if (googleApplicationCredentials) {
    envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
  }

  const baseCtr = withEnvs(
    client
      .pipeline(Job.apply)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", client.cacheVolume("terraform"))
    .withMountedCache("/app/plan", client.cacheVolume("tfplan"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["version"])
    .withExec(["apply", "-auto-approve", "/app/plan/plan.tfplan"]);

  const result = await ctr.stdout();

  await client
    .pipeline("clear_plan")
    .container()
    .from("alpine")
    .withMountedCache("/app/plan", client.cacheVolume("tfplan"))
    .withExec(["sh", "-c", "rm -rf /app/plan/*"])
    .stdout();

  return result;
};

export type JobExec = (src?: string) =>
  | Promise<string>
  | ((
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.init]: init,
  [Job.validate]: validate,
  [Job.plan]: plan,
  [Job.apply]: apply,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.init]: "Initialize a Terraform working directory",
  [Job.validate]: "Validate the configuration files in a directory",
  [Job.plan]: "Generate and show an execution plan",
  [Job.apply]: "Builds or changes infrastructure",
};
