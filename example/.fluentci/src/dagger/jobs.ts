import { Directory, dag } from "../../deps.ts";
import { CacheSharingMode } from "../../sdk/client.gen.ts";
import { filterObjectByPrefix, withEnvs, getDirectory } from "./lib.ts";

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

/**
 * @function
 * @description Initialize a Terraform working directory
 * @param {string | Directory} src
 * @param {string} tfVersion
 * @param {string} googleApplicationCredentials
 * @returns {Promise<string>}
 */
export async function init(
  src: Directory | string | undefined = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string> {
  const context = await getDirectory(dag, src);
  const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

  if (googleApplicationCredentials) {
    envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
  }

  const baseCtr = withEnvs(
    dag
      .pipeline(Job.init)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", dag.cacheVolume("terraform"), {
      sharing: CacheSharingMode.Shared,
    })
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["version"])
    .withExec(["init"])
    .withExec(["cp", ".terraform.lock.hcl", "/app/.terraform"], {
      skipEntrypoint: true,
    });

  const stdout = await ctr.stdout();
  return stdout;
}

/**
 * @function
 * @description Validate the configuration files in a directory
 * @param {string | Directory} src
 * @param {string} tfVersion
 * @returns {Promise<string>}
 */
export async function validate(
  src: Directory | string = ".",
  tfVersion?: string
): Promise<string> {
  const context = await getDirectory(dag, src);
  const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

  const baseCtr = withEnvs(
    dag
      .pipeline(Job.validate)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withDirectory("/app", context, {
      exclude,
    })
    .withMountedCache("/app/.terraform", dag.cacheVolume("terraform"), {
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

  const stdout = await ctr.stdout();
  return stdout;
}

/**
 * @function
 * @description Generate and show an execution plan
 * @param {string | Directory} src
 * @param {string} tfVersion
 * @param {string} googleApplicationCredentials
 * @returns {Promise<string>}
 */
export async function plan(
  src: Directory | string = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string> {
  const context = await getDirectory(dag, src);
  const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

  if (googleApplicationCredentials) {
    envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
  }

  const baseCtr = withEnvs(
    dag
      .pipeline(Job.plan)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", dag.cacheVolume("terraform"), {
      sharing: CacheSharingMode.Shared,
    })
    .withMountedCache("/app/plan", dag.cacheVolume("tfplan"))
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

  const stdout = await ctr.stdout();
  return stdout;
}

/**
 * @function
 * @description Builds or changes infrastructure
 * @param {string | Directory} src
 * @param {string} tfVersion
 * @param {string} googleApplicationCredentials
 * @returns {Promise<string>}
 */
export async function apply(
  src: Directory | string = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string> {
  const context = await getDirectory(dag, src);
  const TF_VERSION = tfVersion || Deno.env.get("TF_VERSION") || "latest";

  if (googleApplicationCredentials) {
    envs.GOOGLE_APPLICATION_CREDENTIALS = googleApplicationCredentials;
  }

  const baseCtr = withEnvs(
    dag
      .pipeline(Job.apply)
      .container()
      .from(`hashicorp/terraform:${TF_VERSION}`),
    envs
  );

  const ctr = baseCtr
    .withMountedCache("/app/.terraform", dag.cacheVolume("terraform"), {
      sharing: CacheSharingMode.Shared,
    })
    .withMountedCache("/app/plan", dag.cacheVolume("tfplan"), {
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

  const stdout = await ctr.stdout();

  await dag
    .pipeline("clear_plan")
    .container()
    .from("alpine")
    .withMountedCache("/app/plan", dag.cacheVolume("tfplan"))
    .withExec(["sh", "-c", "rm -rf /app/plan/*"])
    .stdout();

  return stdout;
}

export type JobExec = (
  src?: Directory | string,
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
