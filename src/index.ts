import express, { Express, Request, Response } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import creatDeletePetRoutes from "../routes/create_delete_pet.route";
import createDeleteDiaryRoutes from "../routes/create_delete_diary.route";
import createUserRoutes from "../routes/create_delete_user.route";
import inforDiaryRoutes from "../routes/infor_diary.route";
import inforPetRoutes from "../routes/infor_pet.route";
import inforUserRoutes from "../routes/infor_user.route";
import loginLogoutUserRoutes from "../routes/login_logout_user.route";
import mql from "../db/mysql";

require("dotenv").config();

// import mysql from "mysql";

const { swaggerUI, specs } = require("../swagger/swagger");
const app: Express = express();
const port = 3000;

mql.connect(function (err: any) {
  if (err) throw err;
  console.log("mysql connected..");
  // console.log(String(Math.random().toString(36).slice(2)));
});

// app.use(cors());
app.use(cors({ credentials: true, origin: "http://localhost:5000" }));
app.use(express.json());
//cookie
app.use(cookieParser());

app.use(createUserRoutes);
app.use(inforUserRoutes);
app.use(loginLogoutUserRoutes);
app.use(creatDeletePetRoutes);
app.use(inforPetRoutes);
app.use(createDeleteDiaryRoutes);
app.use(inforDiaryRoutes);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
