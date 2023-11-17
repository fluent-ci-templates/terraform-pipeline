import { JobSpec, Workflow } from "fluent_github_actions";

export function generateYaml(): Workflow {
  const workflow = new Workflow("Terraform");

  const push = {
    branches: ["main"],
  };

  const apply: JobSpec = {
    "runs-on": "ubuntu-latest",
    steps: [
      {
        uses: "actions/checkout@v2",
      },
      {
        name: "Setup Fluent CI",
        uses: "fluentci-io/setup-fluentci@v2",
      },
      {
        name: "Run Dagger Pipelines",
        run: "fluentci run terraform_pipeline init validate plan apply",
      },
    ],
  };

  workflow.on({ push }).jobs({ apply });

  return workflow;
}
