import { PetAllDiaryModel, PetDiaryModel } from "../../types/diary";
import {
  albumPickDiary,
  getOneDiary,
  getPetAlbumDiarys,
  getPetDiarys,
  getTodayDiaryWritablePets,
  getUserDiarys,
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
 *   /users/auth/diarys/{year}/{month}:
 *     get:
 *        tags:
 *        - diarys
 *        description: "사용자의 반려견들의 모든 다이어리 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "year"
 *          in: "path"
 *          description: "가져올 다이어리의 년도"
 *          required: true
 *          type: "number"
 *          example: "2022"
 *        - name: "month"
 *          in: "path"
 *          description: "가져올 다이어리의 달"
 *          required: true
 *          type: "number"
 *          example: "6"
 *        responses:
 *          "200":
 *            description: "사용자의 모든 다이어리 정보 가져오기 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/AllDiarys'
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / FIND IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
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
 *   /pets/{petId}/diarys/albums:
 *     get:
 *        tags:
 *        - diarys
 *        description: "반려견이 작성한 모든 다이어리들 중 앨범들의 정보 가져오기"
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
 *            description: "모든 앨범들 정보 가져오기 성공"
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
 *   /pets/{petId}/diarys/{diaryId}/{isAlbum}:
 *     patch:
 *        tags:
 *        - diarys
 *        description: "다이어리 앨범 유무 체크하기 (0: 앨범x / 1: 앨범)"
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
 *          description: "수정할 다이어리의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "isAlbum"
 *          in: "path"
 *          description: "앨범 유무 (0 or 1)"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "201":
 *            description: "다이어리 앨범유무 수정 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음 / EXCEED MAX ERROR : 앨범으로 선택 가능한 최대 다이어리 수를 초과 (10개)"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 다이어리가 아님 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /diarys/writable-pets:
 *     get:
 *        tags:
 *        - diarys
 *        description: "당일 다이어리 작성이 가능한 반려견들 (이름, petID) 목록 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "당일 다이어리 작성이 가능한 반려견들 가져오기 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/WritablePets'
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   WritablePets:
 *     type: object
 *     properties:
 *       result:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             petid:
 *               type: number
 *               description: 다이어리 작성이 가능한 반려견의 ID
 *             name:
 *               type: string
 *               description: 다이어리 작성이 가능한 반려견의 이름
 *   AllDiarys:
 *     type: object
 *     properties:
 *       result:
 *         type: object
 *         properties:
 *             '2022-06-01':
 *               type: array
 *               description: 해당 date의 다이어리들 목록 (날짜는 예시)
 */

router.get("/users/auth/diarys/:year/:month", auth, (req, res) => {
  // 사용자가 등록한 모든 반려견의
  // 모든 다이어리의 정보를 반환한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const year: number = Number(req.params.year);
    const month: number = Number(req.params.month);

    if (checkEmptyValue(year) || checkEmptyValue(month)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    getUserDiarys(user.userID, year, month, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

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
    getPetDiarys(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

// 라우트 순서 체크
router.get("/pets/:petId/diarys/albums", auth, (req, res) => {
  // 반려견의 다이어리들 중
  // 앨범으로 pick된 다이어리의 정보를 반환한다.
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
    getPetAlbumDiarys(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get("/pets/:petId/diarys/:diaryId", auth, (req, res) => {
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
});

router.patch("/pets/:petId/diarys/:diaryId/:pick", auth, (req, res) => {
  // 반려견의 다이어리가 맞다면
  // 다이어리 한개의 albumPick 상태를 0/1로 바꾼다
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);
    const diaryID: number = Number(req.params.diaryId);
    const albumPick: number = Number(req.params.pick);
    if (
      checkEmptyValue(petID) ||
      checkEmptyValue(diaryID) ||
      checkEmptyValue(albumPick)
    ) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    albumPickDiary(user.userID, petID, diaryID, albumPick, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get("/diarys/writable-pets", auth, (req, res) => {
  // 당일 다이어리 작성이 가능한 반려견들 목록 반환
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    getTodayDiaryWritablePets(user.userID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
