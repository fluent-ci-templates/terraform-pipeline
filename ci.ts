import {
  init,
  validate,
  plan,
  apply,
} from "https://pkg.fluentci.io/terraform_pipeline@v0.6.4/mod.ts";

await init();
await validate();
await plan();
await apply();
