# Terraform Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fterraform_pipeline&query=%24.version)](https://pkg.fluentci.io/terraform_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.37)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/terraform-pipeline)](https://codecov.io/gh/fluent-ci-templates/terraform-pipeline)

A ready-to-use CI/CD Pipeline for managing your infrastructure with [Terraform](https://www.terraform.io/).

## 🚀 Usage

Run the following command in your project:

```bash
fluentci run terraform_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t terraform
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

## Dagger Module

Use as a [Dagger](https://dagger.io) module:

```bash
dagger mod install github.com/fluent-ci-templates/terraform-pipeline@mod
```

## Environment variables

| Variable                    | Description                                        |
| --------------------------- | -------------------------------------------------- |
| TF_VERSION                  | The Terraform version to use. Defaults to `latest` |
| TF_CLOUD_ORGANIZATION       | The Terraform Cloud organization to use            |
| TF_API_TOKEN                | The Terraform Cloud API token                      |
| TF_WORKSPACE                | The Terraform Cloud workspace to use               |
| TF_LOG                      | The Terraform log level                            |
| TF_LOG_PATH                 | The Terraform log path                             |
| TF_INPUT                    | Whether to ask for input                           |
| TF_VAR_*                    | Terraform variables                                |
| TF_CLI_ARGS                 | Additional Terraform CLI arguments                 |
| TF_CLI_ARGS_*               | Additional Terraform CLI arguments                 |
| TF_DATA_DIR                 | The Terraform data directory                       |
| TF_WORKSPACE                | The Terraform workspace                            |
| TF_IN_AUTOMATION            | Whether Terraform is running in CI                 |
| TF_REGISTRY_DISCOVERY_RETRY | Whether to enable registry discovery               |
| TF_REGISTRY_CLIENT_TIMEOUT  | The registry client timeout                        |
| TF_CLI_CONFIG_FILE          | The Terraform CLI config file                      |
| TF_PLUGIN_CACHE_DIR         | The Terraform plugin cache directory               |
| TF_IGNORE                   | Display ignored files and directories               |

## Jobs

| Job       | Description                            |
| --------- | -------------------------------------- |
| init      | Initialize Terraform working directory |
| validate  | Validate the configuration files       |
| plan      | Generate and show an execution plan    |
| apply     | Builds or changes infrastructure       |

```typescript
init(
  src: Directory | string | undefined = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string> 

validate(
  src: Directory | string = ".",
  tfVersion?: string
): Promise<string>

plan(
  src: Directory | string = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string>

apply(
  src: Directory | string = ".",
  tfVersion?: string,
  googleApplicationCredentials?: string
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { init, validate, plan, apply } from "https://pkg.fluentci.io/terraform_pipeline@v0.6.2/mod.ts";

await init();
await validate();
await plan();
// await apply();

```
