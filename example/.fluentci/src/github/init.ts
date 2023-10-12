import { generateYaml } from "./config.ts";

generateYaml().save(".github/workflows/terraform-apply.yml");
