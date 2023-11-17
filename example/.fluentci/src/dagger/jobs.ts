import { connect, CacheSharingMode } from "../../deps.ts";
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
  tfVersion?: string,
  googleApplicationCredentials?: string
) => {
  await connect(async (client) => {
    const context = client.host().directory(src);
    const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

    if (googleApplicationCredentials) {
      envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
    }

    const baseCtr = withEnvs(
      client
        .pipeline(Job.init)
        .container()
        .from(`hashicorp/terraform:${TF_VERSION}`),
      envs
    );

    const ctr = baseCtr
      .withMountedCache("/app/.terraform", client.cacheVolume("terraform"), {
        sharing: CacheSharingMode.Shared,
      })
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["version"])
      .withExec(["init"])
      .withExec(["cp", ".terraform.lock.hcl", "/app/.terraform"], {
        skipEntrypoint: true,
      });

    await ctr.stdout();

    await ctr;
  });
  return "Initialized";
};

export const validate = async (src = ".", tfVersion?: string) => {
  await connect(async (client) => {
    const context = client.host().directory(src);
    const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

    const baseCtr = withEnvs(
      client
        .pipeline(Job.validate)
        .container()
        .from(`hashicorp/terraform:${TF_VERSION}`),
      envs
    );

    const ctr = baseCtr
      .withDirectory("/app", context, {
        exclude,
      })
      .withMountedCache("/app/.terraform", client.cacheVolume("terraform"), {
        sharing: CacheSharingMode.Shared,
      })
      .withWorkdir("/app")
      .withExec(
        [
          "sh",
          "-c",
          "[ ! -f .terraform/.terraform.lock.hcl ] && terraform init || true",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(
        [
          "sh",
          "-c",
          "[ -f .terraform/.terraform.lock.hcl ] && cp .terraform/.terraform.lock.hcl .",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(["version"])
      .withExec(["validate"]);

    await ctr.stdout();
  });

  return "Configuration validated";
};

export const plan = async (
  src = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
) => {
  await connect(async (client) => {
    const context = client.host().directory(src);
    const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

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
      .withMountedCache("/app/.terraform", client.cacheVolume("terraform"), {
        sharing: CacheSharingMode.Shared,
      })
      .withMountedCache("/app/plan", client.cacheVolume("tfplan"))
      .withDirectory("/app", context, {
        exclude,
      })
      .withWorkdir("/app")
      .withExec(
        [
          "sh",
          "-c",
          "[ ! -f .terraform/.terraform.lock.hcl ] && terraform init || true",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(
        [
          "sh",
          "-c",
          "[ -f .terraform/.terraform.lock.hcl ] && cp .terraform/.terraform.lock.hcl .",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(["version"])
      .withExec(["plan", "-out=/app/plan/plan.tfplan"]);

    await ctr.stdout();
  });
  return "Plan generated";
};

export const apply = async (
  src = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
) => {
  await connect(async (client) => {
    const context = client.host().directory(src);
    const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

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
      .withMountedCache("/app/.terraform", client.cacheVolume("terraform"), {
        sharing: CacheSharingMode.Shared,
      })
      .withMountedCache("/app/plan", client.cacheVolume("tfplan"), {
        sharing: CacheSharingMode.Shared,
      })
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(
        [
          "sh",
          "-c",
          "[ ! -f .terraform/.terraform.lock.hcl ] && terraform init || true",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(
        [
          "sh",
          "-c",
          "[ -f .terraform/.terraform.lock.hcl ] && cp .terraform/.terraform.lock.hcl .",
        ],
        {
          skipEntrypoint: true,
        }
      )
      .withExec(["version"])
      .withExec(["apply", "-auto-approve", "/app/plan/plan.tfplan"]);

    await ctr.stdout();

    await client
      .pipeline("clear_plan")
      .container()
      .from("alpine")
      .withMountedCache("/app/plan", client.cacheVolume("tfplan"))
      .withExec(["sh", "-c", "rm -rf /app/plan/*"])
      .stdout();
  });

  return "Changes applied";
};

export type JobExec = (
  src?: string,
  tfVersion?: string,
  googleApplicationCredentials?: string
) => Promise<string>;

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