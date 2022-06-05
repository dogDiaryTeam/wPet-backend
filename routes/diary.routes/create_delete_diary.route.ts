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
 *   /diarys:
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
 *            description: "다이어리 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 / WRITE IMAGE FILE ERROR : 이미지 처리 중 에러 발생 / WRITE DIARY ERROR : 해시태그 삽입 시 에러 발생 (반환되는 경우 없어야함)"
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
 *       - photo
 *       - texts
 *       - isShare
 *       - petState
 *       - weather
 *       - color
 *       - font
 *       - hashTags
 *     properties:
 *       petIDs:
 *         type: Array<number>
 *         description: 다이어리를 작성할 반려견의 아이디
 *         example: [1,2]
 *       title:
 *         type: string
 *         description: 다이어리 제목
 *         example: "안녕하세요"
 *       photo:
 *         type: string
 *         description: 다이어리 사진 (한장)
 *         example: "aa"
 *       texts:
 *         type: string
 *         description: 다이어리 본문
 *         example: "안녕하세요안녕하세요안녕하세요안녕하세요"
 *       isShare:
 *         type: number
 *         description: 다이어리 공유 유무 (0:공유안함, 1:공유함)
 *         example: "0"
 *       petState:
 *         type: string
 *         description: 당일의 반려견 기분 상태 (추후 상의)
 *         example: "기분 좋음"
 *       weather:
 *         type: string
 *         description: 당일의 날씨 [sunny,sunny-cloudy, snow, rainy, thunderbolt, rainbow, cloudy]
 *         example: "sunny"
 *       color:
 *         type: string
 *         description: 다이어리 배경 색
 *         example: "red"
 *       font:
 *         type: string
 *         description: 다이어리 폰트
 *         example: "aaa"
 *       hashTags:
 *         type: Array<string>
 *         description: 다이어리 해시태그 목록
 *         example: ["강아지", "산책"]
 */

router.post("/diarys", auth, (req: DiaryRequest<CreateDiaryModel>, res) => {
  // 다이어리 작성 할때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const diary: DiaryInforDTO = req.body;

    if (
      checkEmptyValue(diary.petIDs) ||
      diary.petIDs.length === 0 ||
      checkEmptyValue(diary.title) ||
      checkEmptyValue(diary.texts) ||
      checkEmptyValue(diary.isShare) ||
      checkEmptyValue(diary.petState) ||
      checkEmptyValue(diary.weather) ||
      checkEmptyValue(diary.color) ||
      checkEmptyValue(diary.font) ||
      checkEmptyValue(diary.hashTags)
    ) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    createDiary(user.userID, diary, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.delete("/pets/:petId/diarys/:diaryId", auth, (req, res) => {
  // 특정 id 다이어리 삭제
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

    deleteDiary(user.userID, petID, diaryID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
