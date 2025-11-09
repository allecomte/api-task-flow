const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "API documentation to create and authenticate a user and to handle projects, tasks and tags.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email", "password", "firstname", "lastname"],
          properties: {
            _id: { type: "string", description: "User's Id" },
            email: { type: "string", description: "User's email" },
            password: { type: "string", description: "User's password" },
            firstname: { type: "string", description: "User's firstname" },
            lastname: { type: "string", description: "User's lastname" },
            roles: {
              type: "string",
              items: { type: "string", description: "User's roles" },
            },
            projectsOwned: {
              array: "string",
              items: {
                type: "string",
                description: "Ids of projects owned by the user",
              },
            },
            projectsMemberOf: {
              array: "string",
              items: {
                type: "string",
                description: "Ids of projects which the user is a member of",
              },
            },
            tasksAssigned: {
              array: "string",
              items: {
                type: "string",
                description: "Ids of tasks assigned to the user",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User's creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User's last update",
            },
          },
        },
        Project: {
          type: "object",
          required: ["title", "description", "startAt"],
          properties: {
            _id: { type: "string", description: "Project's Id" },
            title: { type: "string", description: "Project's title" },
            description: {
              type: "string",
              description: "Project's description",
            },
            startAt: {
              type: "string",
              format: "date-time",
              description: "Project start date",
            },
            endAt: {
              type: "string",
              format: "date-time",
              description: "Project end date",
            },
            isArchived: {
              type: "boolean",
              description: "Specifies if the project is archived",
            },
            owner: {
              type: "string",
              description: "Id of the project's owner (user who created it)'",
            },
            members: {
              type: "array",
              items: {
                type: "string",
                description: "Ids of the members of the project",
              },
            },
            tasks: {
              type: "array",
              items: {
                type: "string",
                description: "Ids of the tasks of the project",
              },
            },
            tags: {
              type: "array",
              items: {
                type: "string",
                description: "Ids of the tags of the project",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Project's creation date",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Project's last update",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/api-docs/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
