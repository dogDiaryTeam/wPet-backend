import express, { Express, Request, Response } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import createDeleteDiaryRoutes from "../routes/diary.routes/create_delete_diary.route";
import createDeletePetRoutes from "../routes/pet.routes/create_delete_pet.route";
import createDeleteTodolistRoutes from "../routes/todolist.routes/create_delete_todolist.route";
import createDeleteUserRoutes from "../routes/user.routes/create_delete_user.route";
import deleteBeautyRoutes from "../routes/beauty.routes/delete_beauty.route";
import deleteHospitalRecordRoutes from "../routes/hospital.routes/delete_hospital_record.route";
import deleteMedicineRoutes from "../routes/medicine.routes/delete_medicine.route";
import deleteShowerRoutes from "../routes/shower.routes/delete_shower.route";
import inforBeautyRoutes from "../routes/beauty.routes/infor_beauty.route";
import inforDiaryRoutes from "../routes/diary.routes/infor_diary.route";
import inforHospitalRecordRoutes from "../routes/hospital.routes/infor_hospital_record.route";
import inforMedicineRoutes from "../routes/medicine.routes/infor_medicine.route";
import inforPetRoutes from "../routes/pet.routes/infor_pet.route";
import inforShowerRoutes from "../routes/shower.routes/infor_shower.route";
import inforTodolistKeywordRoutes from "../routes/todolist_keyword.routes/infor_todolist_keyword.route";
import inforTodolistRoutes from "../routes/todolist.routes/infor_todolist.route";
import inforUserRoutes from "../routes/user.routes/infor_user.route";
import loginLogoutUserRoutes from "../routes/user.routes/login_logout_user.route";
import mql from "../db/mysql/mysql";
import registerBeautyRoutes from "../routes/beauty.routes/register_beauty.route";
import registerHospitalRecordRoutes from "../routes/hospital.routes/register_hospital_record.route";
import registerMedicineRoutes from "../routes/medicine.routes/register_medicine.route";
import registerShowerRoutes from "../routes/shower.routes/register_shower.route";

require("dotenv").config();

const { swaggerUI, specs } = require("../swagger/swagger");
const app: Express = express();
const port = 3000;

mql.connect(function (err: any) {
  if (err) throw err;
  console.log("mysql connected..");
});

app.use(cors({ credentials: true, origin: "http://localhost:5000" }));
// 기존의 express.json()는 100kb까지만 받기 가능
app.use(express.json({ limit: "50mb" }));
//cookie
app.use(cookieParser());

app.use(createDeleteUserRoutes);
app.use(inforUserRoutes);
app.use(loginLogoutUserRoutes);
app.use(createDeletePetRoutes);
app.use(inforPetRoutes);
app.use(createDeleteDiaryRoutes);
app.use(inforDiaryRoutes);
app.use(createDeleteTodolistRoutes);
app.use(inforTodolistRoutes);
app.use(registerShowerRoutes);
app.use(inforShowerRoutes);
app.use(deleteShowerRoutes);
app.use(registerBeautyRoutes);
app.use(inforBeautyRoutes);
app.use(deleteBeautyRoutes);
app.use(registerMedicineRoutes);
app.use(inforMedicineRoutes);
app.use(deleteMedicineRoutes);
app.use(registerHospitalRecordRoutes);
app.use(inforHospitalRecordRoutes);
app.use(deleteHospitalRecordRoutes);
app.use(inforTodolistKeywordRoutes);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
