import express, { Express, Request, Response } from "express";

import mql from "../db/mysql";
import testRoutes from "../routes/test.route";

// import mysql from "mysql";


const { swaggerUI, specs } = require("../swagger/swagger");
const cors = require("cors");

const app: Express = express();
const port = 3000;

mql.connect(function (err: any) {
  if (err) throw err;
  console.log("mysql connected..");
});

app.use(cors());
app.use(express.json());

app.use(testRoutes);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
