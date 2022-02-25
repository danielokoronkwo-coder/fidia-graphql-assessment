import { ApolloServer, gql } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core"
import express from "express"
import mongoose from "mongoose"
import http from 'http'
import bodyParser from 'body-parser'
import 'dotenv/config'
import authRoutes from './routes/auth.route'
import typeDefs from "./src/auth/schemas/TypeDefs"
import resolvers from "./src/auth/schemas/Resolvers"
import { verifyPassword } from "./src/utils/encrypt"
const DB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/fidia'
const APP_PORT = process.env.PORT || 4000



const startServer = async (typeDefs, resolvers) => {
  
  const app = express()
  
// Body-parser middleware
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())  
  app.use('/api/v1/auth', authRoutes)

  try {
    await mongoose.connect(DB_URL)
    console.log('mongo connected')
  } catch (error) {
    console.log({ message: error.message })
  }

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start(); 
  server.applyMiddleware({ app });
  
  await new Promise(resolve => httpServer.listen({ port: APP_PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startServer(typeDefs, resolvers)
