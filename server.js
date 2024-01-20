const express = require("express");
const expressGraphQL = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

const users = [
  { id: 1, name: "John Doe", email: "john.doe@example.com" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
  { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com" },
];

const tasks = [
  {
    id: 1,
    title: "Finish GraphQL tutorial",
    userId: 1,
    description: "Complete the tutorial on building GraphQL APIs.",
  },
  {
    id: 2,
    title: "Write blog post",
    userId: 2,
    description: "Write a blog post about the benefits of GraphQL.",
  },
  {
    id: 3,
    title: "Implement user authentication",
    userId: 2,
    description: "Add user authentication to the application.",
  },
  {
    id: 4,
    title: "Make breakfast",
    userId: 3,
    description: "Boil eggs, slice bread",
  },
];

const TaskType = new GraphQLObjectType({
  name: "Task",
  description: "It shows a single task",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    userId: { type: GraphQLNonNull(GraphQLInt) },
    description: { type: GraphQLNonNull(GraphQLString) },
    user: {
      type: UserType,
      resolve: (task) => users.find((user) => user.id === task.userId),
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "It shows a single user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    tasks: {
      type: new GraphQLList(TaskType),
      resolve: (user) => tasks.filter((task) => task.userId === user.id),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    tasks: {
      type: new GraphQLList(TaskType),
      description: "All tasks",
      resolve: () => tasks,
    },
    users: {
      type: new GraphQLList(UserType),
      description: "All users",
      resolve: () => users,
    },
    task: {
      type: TaskType,
      description: "Single Task",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => tasks.find((task) => task.id === args.id),
    },
    user: {
      type: UserType,
      description: "Single User",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => users.find((user) => user.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      description: "Add User",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const { name, email } = args;

        const newUser = {
          id: users.length + 1,
          name: name,
          email: email,
        };

        users.push(newUser);

        return newUser;
      },
    },
    addTask: {
      type: TaskType,
      description: "Add a task",
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLInt) },
        description: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const { title, userId, description } = args;
        const newTask = {
          title: title,
          description: description,
          userId: userId,
          id: tasks.length + 1,
        };

        tasks.push(newTask);

        return newTask;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("Server Running"));
