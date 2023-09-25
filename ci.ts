import Client, { connect } from "https://sdk.fluentci.io/v0.1.9/mod.ts";
import {
  init,
  validate,
  plan,
  apply,
} from "https://pkg.fluentci.io/terraform_pipeline@v0.3.2/mod.ts";

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await init(client, src);
    await validate(client, src);
    await plan(client, src);
    // await apply(client, src);
  });
}

pipeline();
