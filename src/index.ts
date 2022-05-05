import express, { Express, Request, Response } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import mql from "../db/mysql";
import userRoutes from "../routes/user.route";

// import mysql from "mysql";

const { swaggerUI, specs } = require("../swagger/swagger");
const app: Express = express();
const port = 3000;

mql.connect(function (err: any) {
  if (err) throw err;
  console.log("mysql connected..");
});

app.use(cors());
app.use(express.json());
//cookie
app.use(cookieParser());

app.use(userRoutes);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
