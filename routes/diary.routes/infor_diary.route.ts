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
 *   /api/diary/getall:
 *     post:
 *        tags:
 *        - diarys
 *        description: "반려견이 작성한 모든 다이어리의 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - petID
 *                  - diaryID
 *                properties:
 *                  petID:
 *                    type: number
 *                    description: 다이어리를 작성한 반려견의 아이디
 *                    example: "1"
 *                  diaryID:
 *                    type: number
 *                    description: 정보를 가져올 다이어리의 아이디
 *                    example: "1"
 *        responses:
 *          "200":
 *            description: "모든 다이어리 정보 가져오기 성공"
 *          "400":
 *            description: "모든 다이어리 정보 가져오기 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "사용자가 등록한 반려견이 아닙니다."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/diary/getinfo:
 *     post:
 *        tags:
 *        - diarys
 *        description: "반려견이 작성한 다이어리 한개의 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - petID
 *                  - diaryID
 *                properties:
 *                  petID:
 *                    type: number
 *                    description: 다이어리를 작성한 반려견의 아이디
 *                    example: "1"
 *                  diaryID:
 *                    type: number
 *                    description: 정보를 가져올 다이어리의 아이디
 *                    example: "1"
 *        responses:
 *          "200":
 *            description: "다이어리 정보 가져오기 성공"
 *          "400":
 *            description: "다이어리 정보 가져오기 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "사용자가 등록한 반려견이 아니거나 반려견의 다이어리가 아니거나 다이어리가 존재하지 않습니다."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.post(
  "/api/diary/getall",
  auth,
  (req: DiaryRequest<PetAllDiaryModel>, res) => {
    // 반려견의 다이어리가 맞다면
    // 모든 다이어리의 정보를 반환한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const petID: number = req.body.petID;
      if (checkEmptyValue(petID)) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      getDiarys(user.userID, petID, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

router.post(
  "/api/diary/getinfo",
  auth,
  (req: DiaryRequest<PetDiaryModel>, res) => {
    // 반려견의 다이어리가 맞다면
    // 다이어리 한개의 정보를 반환한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const petID: number = req.body.petID;
      const diaryID: number = req.body.diaryID;
      if (checkEmptyValue(petID) || checkEmptyValue(diaryID)) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      getOneDiary(user.userID, petID, diaryID, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

export default router;
