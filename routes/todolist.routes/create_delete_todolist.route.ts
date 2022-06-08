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

/**
 * @swagger
 * paths:
 *   /todolists:
 *     post:
 *        tags:
 *        - todolists
 *        description: "투두리스트 생성하기 (반려견 한마리 당)"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Todolist_create_req"
 *        responses:
 *          "201":
 *            description: "투두리스트 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음 (키워드가 DB에 존재하지 않은 경우 포함)"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   Todolist_create_req:
 *     type: object
 *     required:
 *       - petID
 *       - date
 *       - content
 *       - keyword
 *     properties:
 *       petID:
 *         type: number
 *         description: 투두리스트 생성할 반려견의 ID
 *         example: "1"
 *       date:
 *         type: date
 *         description: 투두리스트 날짜
 *         example: "2022-01-01"
 *       content:
 *         type: string
 *         description: 투두리스트 내용
 *         example: "밥먹기"
 *       keyword:
 *         type: string
 *         description: 해당하는 키워드 (서버에서 제공하는 키워드 내에서 선택 가능)
 *         example: "Food"
 */

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
