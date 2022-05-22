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
 *   /api/user/create:
 *     post:
 *        tags:
 *        - users
 *        description: "사용자 생성하기"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/User_create_req"
 *        responses:
 *          "200":
 *            description: "사용자 생성 성공"
 *          "400":
 *            description: "사용자 생성 실패"
 *          "403":
 *            description: "이메일 인증을 하지않음"
 *          "409":
 *            description: "이미 유일값을 가진 유저가 존재"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/sendauthemail:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 인증) 인증번호 메일 전송"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test1@naver.com"
 *        responses:
 *          "200":
 *            description: "인증메일 전송 성공"
 *          "400":
 *            description: "이메일 형식이 유효하지 않습니다."
 *          "500":
 *            description: "서버 내의 문제 발생."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/compareauthemail:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 인증) 인증번호 동일한지 확인"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                  - authString
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test1@naver.com"
 *                  authString:
 *                    type: string
 *                    description: 사용자가 입력한 인증번호
 *                    example: "zz9llj3auf"
 *        responses:
 *          "200":
 *            description: "인증 성공"
 *          "400":
 *            description: "요청 형식이 유효하지 않음."
 *          "401":
 *            description: "인증번호가 일치하지 않음."
 *          "404":
 *            description: "부여된 인증번호가 없음."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   User_create_req:
 *     type: object
 *     required:
 *       - email
 *       - pw
 *       - nickName
 *       - profilePicture
 *     properties:
 *       email:
 *         type: string
 *         description: 사용자 이메일 주소
 *         example: "test1@naver.com"
 *       pw:
 *         type: string
 *         description: 사용자 비밀번호(8-13자)
 *         example: "1111aaaa"
 *       nickName:
 *         type: string
 *         description: 사용자 닉네임(1-15자)
 *         example: "수민"
 *       profilePicture:
 *         type: string
 *         description: 사용자 프로필사진
 *         example: "aaa"
 *       location:
 *         type: string
 *         description: 사용자 주소
 *         example: "수원"
 */

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
