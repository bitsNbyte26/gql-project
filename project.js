const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    variants: [Variant!]!
  }

  type Variant {
    id: ID!
    name: String!
  }

  type Query {
    products: [Product!]!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
  }

  input CreateOrderInput {
    buyerId: ID!
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    variantId: ID!
    quantity: Int!
  }

  type Order {
    id: ID!
    buyerId: ID!
    totalAmount: Float!
    orderItems: [OrderItem!]!
  }

  type OrderItem {
    id: ID!
    variantId: ID!
    quantity: Int!
  }
`;

const resolvers = {
  Query: {
    
      products: async () => {
            // Fetch products from the database
                try 
            {
                // Fetch products from the database
                const products = await Product.find(); // Example: Using an ORM or database client
                return products;
            } 
            catch (error) 
            {
                console.error('Error fetching products:', error);
                throw new Error('Unable to fetch products');
            }
        }
    
    },
  // Define mutation resolvers here
  Mutation: {
        createOrder: async (_, { input }) => {
        try {
                // Create order in the database
                const order = await Order.create(input);
                // Update inventory (decrease quantity) for each item in the order
                for (const item of input.items) {
                 await Variant.findByIdAndUpdate(item.variantId, { $inc: { quantity: -item.quantity } });
                }
                return order;
            }   
            catch (error) {
                console.error('Error creating order:', error);
                throw new Error('Unable to create order');
            }
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
});
