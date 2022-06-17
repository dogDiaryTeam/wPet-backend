import {
  PetIDModel,
  PetInforDTO,
  UpdatePetInforDTO,
  UpdatePetModel,
} from "../../types/pet";
import {
  getAllSpecies,
  getPetInfor,
  getUserPets,
  updatePetInfor,
} from "../../controllers/pet.controllers/infor_pet.controller";

import { PetRequest } from "../../types/express";
import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /users/auth/pets:
 *     get:
 *        tags:
 *        - pets
 *        description: "사용자가 등록한 반려견들의 정보 (petID, name, photo) 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "반려견들의 이름 가져오기 성공"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /pets/{petId}:
 *     delete:
 *        tags:
 *        - pets
 *        description: "반려견 등록 삭제"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "삭제할 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "반려견 삭제 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 / DELETE IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     get:
 *        tags:
 *        - pets
 *        description: "반려견 한마리의 정보 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "정보를 가져올 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "반려견 정보 가져오기 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 이미지 파일을 찾지 못함 / FIND IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     patch:
 *        tags:
 *        - pets
 *        description: "반려견 정보 수정하기 (수정할 정보만 요청 (여러줄이어도 가능))"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "정보를 수정할 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    description: 반려견 이름
 *                    example: "검둥이"
 *                  birthDate:
 *                    type: date
 *                    description: 반려견 생년월일
 *                    example: "2022-01-02"
 *                  gender:
 *                    type: string
 *                    description: 반려견 성별
 *                    example: "남"
 *                  weight:
 *                    type: number
 *                    description: 반려견 몸무게 (null을 보낼때는 0을 보내면 됨)
 *                    example: "20.9"
 *                  photo:
 *                    type: string
 *                    description: 반려견 사진
 *                    example: "bb"
 *                  breeds:
 *                    type: Array<string>
 *                    description: 반려견 종들 (1-3종)
 *                    example: ["그레이 하운드"]
 *        responses:
 *          "201":
 *            description: "반려견 정보 수정 성공"
 *          "204":
 *            description: "(모든 row) 기존의 반려견 정보와 수정할 정보가 같음 (수정X) (no content -> 아무 메시지도 반환x) (row 하나라도 기존정보와 다르면 정상적으로 작동)"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음 (이름 중복...)"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/PetUpdateErr'
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 / PARTIALLY UPDATE SUCCEED, WRITE(DELETE) IMAGE FILE ERROR : 사진과 종을 제외한 데이터는 수정완료지만 이미지 처리 중 에러 발생 / UPDATE BREEDS ERROR : 종 업데이트 중 에러 발생 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /breeds:
 *     get:
 *        tags:
 *        - pets
 *        description: "모든 반려견 종 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "모든 반려견 종 가져오기 성공"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   PetUpdateErr:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *         description: 사용자 이메일 주소
 *         example: "test4@naver.com"
 *       errorMessage:
 *         type: object
 *         properties:
 *           invalidFormat:
 *             type: Array<string>
 *             description: 유효하지 않은 요청 데이터들을 반환
 *           duplication:
 *             type: Array<string>
 *             description: 중복값을 요청하는 데이터들을 반환
 *           sqlErr:
 *             type: Array<string>
 *             description: DB, IMAGE 로직 에러들을 반환 (반환되면 안됨)
 */

router.get("/users/auth/pets", auth, (req, res) => {
  // 사용자가 등록한 pet들 정보 return
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    getUserPets(user.userID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get("/pets/:petId", auth, (req, res) => {
  // 사용자가 등록한 pet 중
  // 해당 petID pet 정보 return

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
    getPetInfor(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.patch("/pets/:petId", auth, (req: PetRequest<UpdatePetModel>, res) => {
  // 사용자가 등록한 반려견의 정보 중
  // 수정할 부분을 요청으로 보내면
  // 해당 부분에 대해 수정을 진행
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);

    //object
    const param: UpdatePetInforDTO = req.body;

    if (param.name && checkEmptyValue(param.name))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    else if (param.birthDate && checkEmptyValue(param.birthDate))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    else if (param.gender && checkEmptyValue(param.gender))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    else if (param.weight && checkEmptyValue(param.weight))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    else if (param.breeds && checkEmptyValue(param.breeds))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    updatePetInfor(user.userID, petID, param, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get("/breeds", auth, (req, res) => {
  // 사용자가 등록한 pet들 정보 return
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    getAllSpecies(res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});
export default router;
