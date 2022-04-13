const gql = require("graphql-tag");
const userTypes = gql`
  type User {
    id: ID
    name: String
    email: String
    password: String
    picture: String
    role: String
    accessToken: Token
    friends: UserCompact
  }
  
  type UserCompact {
    id: ID
    name: String
    credit_limit: String
  }
  
  type Token {
    token: String
  }
  input UserLogin {
    email: String!
    password: String!
  }
  input UserCreate {
    name: String
    email: String!
    password: String!
    role: String
  }
  input UserDelete {
    id: ID!
    email: String!
  }


  type Query {
    users: [UserCompact]
    user(id: ID): User
  }
  type Mutation {
    login(input: UserLogin!): User
    createUser(input: UserCreate): User
    updateUserPassword(input: UserLogin): String
    deleteUser(input: UserDelete): User
  }
  
  type Subscription {
    newUserEvent: UserCompact
  }
  `
module.exports = userTypes
