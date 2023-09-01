import Client, { connect } from "@dagger.io/dagger";
import * as jobs from "./jobs.ts";

const { init, validate, plan, runnableJobs } = jobs;

export default function pipeline(_src = ".", args: string[] = []) {
  connect(async (client: Client) => {
    if (args.length > 0) {
      await runSpecificJobs(client, args as jobs.Job[]);
      return;
    }

    await init(client);
    await validate(client);
    await plan(client);
  });
}

async function runSpecificJobs(client: Client, args: jobs.Job[]) {
  for (const name of args) {
    const job = runnableJobs[name];
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }
    await job(client);
  }
}
