import {
  CreateDiaryModel,
  DiaryInforDTO,
  PetDiaryModel,
} from "../../types/diary";
import {
  createDiary,
  deleteDiary,
} from "../../controllers/diary.controllers/create_delete_diary.controller";

import { DiaryRequest } from "../../types/express";
import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /api/diary/create:
 *     post:
 *        tags:
 *        - diarys
 *        description: "다이어리 생성하기"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Diary_create_req"
 *        responses:
 *          "200":
 *            description: "반려견 생성 성공"
 *          "400":
 *            description: "반려견 정보 형식이 유효하지 않습니다."
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "반려견 종이 DB에 존재하지 않습니다."
 *          "409":
 *            description: "사용자가 등록한 반려견의 이름과 중복됩니다."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/diary/delete:
 *     post:
 *        tags:
 *        - diarys
 *        description: "다이어리 삭제하기"
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
 *                    description: 삭제할 다이어리의 아이디
 *                    example: "1"
 *        responses:
 *          "200":
 *            description: "다이어리 삭제 성공"
 *          "400":
 *            description: "다이어리 삭제 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "사용자가 등록한 반려견이 아니거나 반려견의 다이어리가 아닙니다."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   Diary_create_req:
 *     type: object
 *     required:
 *       - petIDs
 *       - title
 *       - picture
 *       - texts
 *       - shareIs
 *       - petState
 *       - weather
 *       - color
 *       - font
 *       - hashTags
 *     properties:
 *       petIDs:
 *         type: Array<number>
 *         description: 다이어리를 작성할 반려견의 아이디
 *         example: "1"
 *       title:
 *         type: string
 *         description: 다이어리 제목
 *         example: "안녕하세요"
 *       picture:
 *         type: string
 *         description: 다이어리 사진 (한장)
 *         example: "aa"
 *       texts:
 *         type: string
 *         description: 다이어리 본문
 *         example: "안녕하세요안녕하세요안녕하세요안녕하세요"
 *       shareIs:
 *         type: number
 *         description: 다이어리 공유 유무 (0:공유안함, 1:공유함)
 *         example: "0"
 *       petState:
 *         type: string
 *         description: 당일의 반려견 기분 상태 (추후 상의)
 *         example: "기분 좋음"
 *       weather:
 *         type: string
 *         description: 당일의 날씨 [맑음,흐림,비,번개,눈,바람]
 *         example: "맑음"
 *       color:
 *         type: string
 *         description: 다이어리 배경 색
 *         example: "red?"
 *       font:
 *         type: string
 *         description: 다이어리 폰트
 *         example: "aaa"
 *       hashTags:
 *         type: Array<string>
 *         description: 다이어리 해시태그 목록
 *         example: ["강아지", "산책"]
 */

router.post(
  "/api/diary/create",
  auth,
  (req: DiaryRequest<CreateDiaryModel>, res) => {
    // 다이어리 작성 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const diary: DiaryInforDTO = req.body;
      console.log("🚀 ~ diary", diary);
      console.log("🚀 ~ req.body", req.body);

      if (
        checkEmptyValue(diary.petIDs) ||
        diary.petIDs.length === 0 ||
        checkEmptyValue(diary.title) ||
        checkEmptyValue(diary.texts) ||
        checkEmptyValue(diary.shareIs) ||
        checkEmptyValue(diary.petState) ||
        checkEmptyValue(diary.weather) ||
        checkEmptyValue(diary.color) ||
        checkEmptyValue(diary.font) ||
        checkEmptyValue(diary.hashTags)
      ) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      createDiary(user.userID, diary, res);
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
  "/api/diary/delete",
  auth,
  (req: DiaryRequest<PetDiaryModel>, res) => {
    // 특정 id 다이어리 삭제
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const petID: number = req.body.petID;
      const diaryID: number = req.body.diaryID;
      console.log("🚀 ~ diaryID", diaryID);

      if (checkEmptyValue(petID) || checkEmptyValue(diaryID)) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }

      deleteDiary(user.userID, petID, diaryID, res);
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
