import {
  CreateTodolistModel,
  CreateTodolistReqDTO,
  InforTodolistModel,
  InforTodolistReqDTO,
} from "../../types/todolist";

import { Router } from "express";
import { TodolistRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { checkTodolist } from "../../controllers/todolist.controllers/infor_todolist.controller";

const router = Router();

router.post("/pets/:petId/todolists/:todolistId", auth, (req, res) => {
  // 반려견 한마리 당 가지는
  // 투두리스트 중
  // 완료 후 체크
  let user: UserInforDTO | null = req.user;

  if (user) {
    const petID: number = Number(req.params.petId);
    const todolistID: number = Number(req.params.todolistId);

    if (checkEmptyValue(petID) || checkEmptyValue(todolistID)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    checkTodolist(user.userID, petID, todolistID, res);
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
