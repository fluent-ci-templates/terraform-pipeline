import { init, validate, plan, apply } from "jsr:@fluentci/terraform";

await init();
await validate();
await plan();
await apply();
