const { makeExecutableSchema} = require ("@graphql-tools/schema");
const merge = require ('lodash.merge')
const { userTypes, userResolvers } = require('./users')

const schema = makeExecutableSchema({
  typeDefs: [
    userTypes
  ],
  resolvers: merge(
    userResolvers
  )
  }
)

module.exports = schema
