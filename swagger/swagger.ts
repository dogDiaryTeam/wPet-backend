import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wpet API",
      version: "1.0.0",
      description: "Test API of Wpet",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUI,
  specs,
};
