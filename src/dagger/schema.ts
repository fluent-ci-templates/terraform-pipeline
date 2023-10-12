import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { init, validate, plan, apply } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("init", {
      args: {
        src: nonNull(stringArg()),
        googleApplicationCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await init(args.src, args.googleApplicationCredentials),
    });
    t.string("validate", {
      args: {
        src: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) => await validate(args.src),
    });
    t.string("plan", {
      args: {
        src: nonNull(stringArg()),
        googleCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await plan(args.src, args.googleCredentials),
    });
    t.string("apply", {
      args: {
        src: nonNull(stringArg()),
        googleApplicationCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await apply(args.src, args.googleApplicationCredentials),
    });
  },
});

export const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});
