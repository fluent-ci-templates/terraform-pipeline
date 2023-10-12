import { gql } from "../../deps.ts";

export const init = gql`
  query init($src: String!, $googleApplicationCredentials) {
    init(src: $src, googleApplicationCredentials: $googleApplicationCredentials)
  }
`;

export const validate = gql`
  query validate($src: String!) {
    validate(src: $src)
  }
`;

export const plan = gql`
  query plan($src: String!, $googleApplicationCredentials: String) {
    plan(src: $src, googleApplicationCredentials: $googleApplicationCredentials)
  }
`;

export const apply = gql`
  query apply($src: String!, $googleApplicationCredentials: String) {
    apply(
      src: $src
      googleApplicationCredentials: $googleApplicationCredentials
    )
  }
`;
