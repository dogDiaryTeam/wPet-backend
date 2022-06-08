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

/**
 * @swagger
 * paths:
 *   /pets/{petId}/todolists/{todolistId}:
 *     delete:
 *        tags:
 *        - todolists
 *        description: "투두리스트 삭제하기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "투두리스트를 작성한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "todolistId"
 *          in: "path"
 *          description: "투두리스트 ID"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "투두리스트 삭제 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 투두리스트가 아닌 경우 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     post:
 *        tags:
 *        - todolists
 *        description: "투두리스트 한개 체크하기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "투두리스트를 작성한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "todolistId"
 *          in: "path"
 *          description: "투두리스트 ID"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "201":
 *            description: "투두리스트 체크 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 다이어리가 아님 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

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
