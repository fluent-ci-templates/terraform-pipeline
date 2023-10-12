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
        tfVersion: stringArg(),
        googleApplicationCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await init(args.src, args.tfVersion, args.googleApplicationCredentials),
    });
    t.string("validate", {
      args: {
        src: nonNull(stringArg()),
        tfVersion: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await validate(args.src, args.tfVersion),
    });
    t.string("plan", {
      args: {
        src: nonNull(stringArg()),
        tfVersion: stringArg(),
        googleApplicationCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await plan(args.src, args.tfVersion, args.googleApplicationCredentials),
    });
    t.string("apply", {
      args: {
        src: nonNull(stringArg()),
        tfVersion: stringArg(),
        googleApplicationCredentials: stringArg(),
      },
      resolve: async (_root, args, _ctx) =>
        await apply(
          args.src,
          args.tfVersion,
          args.googleApplicationCredentials
        ),
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
