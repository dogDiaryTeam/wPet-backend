import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { getTodolistKeywords } from "../../controllers/todolist_keyword.controllers/infor_todolist_keyword.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /todolist-keyword:
 *     get:
 *        tags:
 *        - todolist-keywords
 *        description: "투두리스트 키워드 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "투두리스트 키워드 가져오기 성공"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.get("/todolist-keyword", auth, (req, res) => {
  // db에 저장된 키워드들 가져오기
  let user: UserInforDTO | null = req.user;

  if (user) {
    getTodolistKeywords(res);
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
