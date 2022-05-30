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
  "/api/todolist/create",
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
        checkEmptyValue(todolist.listDate) ||
        checkEmptyValue(todolist.content) ||
        checkEmptyValue(todolist.keyword)
      ) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      createTodolist(user.userID, todolist, res);
      // creatUser(user, res);
    } else {
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

router.post(
  "/api/todolist/delete",
  auth,
  (req: TodolistRequest<InforTodolistModel>, res) => {
    // 반려견 한마리 당 투두리스트를 작성
    // 해당되는 날짜의 투두리스트 내용을 받아
    // db에 저장
    let user: UserInforDTO | null = req.user;

    if (user) {
      const todolist: InforTodolistReqDTO = req.body;
      console.log("🚀 ~ todolist", todolist);
      if (
        checkEmptyValue(todolist.petID) ||
        checkEmptyValue(todolist.todoListID)
      ) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      deleteTodolist(user.userID, todolist, res);
      // creatUser(user, res);
    } else {
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

export default router;
