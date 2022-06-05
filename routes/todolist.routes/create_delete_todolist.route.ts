import {
  CreateTodolistModel,
  CreateTodolistReqDTO,
  InforTodolistModel,
  InforTodolistReqDTO,
} from "../../types/todolist";
import {
  createTodolist,
  deleteTodolist,
} from "../../controllers/todolist.controllers/create_delete_todolist.controller";

import { Router } from "express";
import { TodolistRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

router.post(
  "/todolists",
  auth,
  (req: TodolistRequest<CreateTodolistModel>, res) => {
    // 반려견 한마리 당 투두리스트를 작성
    // 해당되는 날짜의 투두리스트 내용을 받아
    // db에 저장
    let user: UserInforDTO | null = req.user;

    if (user) {
      const todolist: CreateTodolistReqDTO = req.body;
      console.log("🚀 ~ todolist", todolist);
      if (
        checkEmptyValue(todolist.petID) ||
        checkEmptyValue(todolist.date) ||
        checkEmptyValue(todolist.content) ||
        checkEmptyValue(todolist.keyword)
      ) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      createTodolist(user.userID, todolist, res);
      // creatUser(user, res);
    } else {
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

router.delete("/pets/:petId/todolists/:todolistId", auth, (req, res) => {
  // 반려견 한마리 당 투두리스트를 작성
  // 해당되는 날짜의 투두리스트 내용을 받아
  // db에 저장
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
    deleteTodolist(user.userID, petID, todolistID, res);
    // creatUser(user, res);
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
