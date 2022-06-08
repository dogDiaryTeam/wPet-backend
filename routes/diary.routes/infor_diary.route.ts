import { PetAllDiaryModel, PetDiaryModel } from "../../types/diary";
import {
  getDiarys,
  getOneDiary,
} from "../../controllers/diary.controllers/infor_diary.controller";

import { DiaryRequest } from "../../types/express";
import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /pets/{petId}/diarys:
 *     get:
 *        tags:
 *        - diarys
 *        description: "반려견이 작성한 모든 다이어리의 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "다이어리를 작성한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "모든 다이어리 정보 가져오기 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 / FIND IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /pets/{petId}/diarys/{diaryId}:
 *     delete:
 *        tags:
 *        - diarys
 *        description: "다이어리 삭제하기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "다이어리를 작성한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "diaryId"
 *          in: "path"
 *          description: "삭제할 다이어리의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "다이어리 삭제 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 다이어리가 아님 / DELETE IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     get:
 *        tags:
 *        - diarys
 *        description: "반려견이 작성한 다이어리 한개의 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "다이어리를 작성한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "diaryId"
 *          in: "path"
 *          description: "정보를 가져올 다이어리의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "다이어리 정보 가져오기 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 다이어리가 아니거나 이미지 파일을 찾을 수 없음 / FIND IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.get("/pets/:petId/diarys", auth, (req, res) => {
  // 반려견의 다이어리가 맞다면
  // 모든 다이어리의 정보를 반환한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);
    if (checkEmptyValue(petID)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    getDiarys(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get(
  "/pets/:petId/diarys/:diaryId",
  auth,
  (req: DiaryRequest<PetDiaryModel>, res) => {
    // 반려견의 다이어리가 맞다면
    // 다이어리 한개의 정보를 반환한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const petID: number = Number(req.params.petId);
      const diaryID: number = Number(req.params.diaryId);
      if (checkEmptyValue(petID) || checkEmptyValue(diaryID)) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      getOneDiary(user.userID, petID, diaryID, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

export default router;
