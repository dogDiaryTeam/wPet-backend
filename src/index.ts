import express, { Express, Request, Response } from "express";

import testRoutes from "../routes/test";

const { swaggerUI, specs } = require("../swagger/swagger");
const cors = require("cors");

const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(testRoutes);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
