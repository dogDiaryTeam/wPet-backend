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

router.post(
  "/api/todolist/check",
  auth,
  (req: TodolistRequest<InforTodolistModel>, res) => {
    // 반려견 한마리 당 가지는
    // 투두리스트 중
    // 완료 후 체크
    let user: UserInforDTO | null = req.user;

    if (user) {
      const todolist: InforTodolistReqDTO = req.body;
      console.log("🚀 ~ todolist", todolist);
      if (
        checkEmptyValue(todolist.petID) ||
        checkEmptyValue(todolist.todoListID)
      ) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      checkTodolist(user.userID, todolist, res);
    } else {
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

export default router;
