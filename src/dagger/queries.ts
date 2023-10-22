import { gql } from "../../deps.ts";

export const init = gql`
  query init(
    $src: String!
    $tfVersion: String
    $googleApplicationCredentials: String
  ) {
    init(
      src: $src
      tfVersion: $tfVersion
      googleApplicationCredentials: $googleApplicationCredentials
    )
  }
`;

export const validate = gql`
  query validate(
    $src: String!
    $tfVersion: String
    $googleApplicationCredentials: String
  ) {
    validate(
      src: $src
      tfVersion: $tfVersion
      googleApplicationCredentials: $googleApplicationCredentials
    )
  }
`;

export const plan = gql`
  query plan(
    $src: String!
    $tfVersion: String
    $googleApplicationCredentials: String
  ) {
    plan(
      src: $src
      tfVersion: $tfVersion
      googleApplicationCredentials: $googleApplicationCredentials
    )
  }
`;

export const apply = gql`
  query apply(
    $src: String!
    $tfVersion: String
    $googleApplicationCredentials: String
  ) {
    apply(
      src: $src
      tfVersion: $tfVersion
      googleApplicationCredentials: $googleApplicationCredentials
    )
  }
`;
