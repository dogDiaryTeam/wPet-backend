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
 *   /api/pet/getnames:
 *     get:
 *        tags:
 *        - pets
 *        description: "사용자가 등록한 반려견들의 이름 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "반려견들의 이름 가져오기 성공"
 *          "400":
 *            description: "반려견들의 이름 가져오기 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/pet/getinfo:
 *     post:
 *        tags:
 *        - pets
 *        description: "반려견 한마리의 정보 가져오기"
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
 *                properties:
 *                  petID:
 *                    type: number
 *                    description: 정보를 가져올 반려견의 아이디
 *                    example: "1"
 *        responses:
 *          "200":
 *            description: "반려견 정보 가져오기 성공"
 *          "400":
 *            description: "반려견 정보 가져오기 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "사용자가 등록한 반려견이 아닙니다."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/pet/update:
 *     patch:
 *        tags:
 *        - pets
 *        description: "반려견 정보 수정하기 (수정할 정보만 요청)"
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
 *                  - updateElement
 *                properties:
 *                  petID:
 *                    type: number
 *                    description: 정보를 수정할 반려견의 아이디
 *                    example: "1"
 *                  updateElement:
 *                    type: object
 *                    description: 수정할 정보 (하나씩만)
 *                    properties:
 *                      petName:
 *                        type: string
 *                        description: 반려견 이름
 *                        example: "검둥이"
 *                      birthDate:
 *                        type: date
 *                        description: 반려견 생년월일
 *                        example: "2022-01-02"
 *                      petSex:
 *                        type: string
 *                        description: 반려견 성별
 *                        example: "남자"
 *                      weight:
 *                        type: number
 *                        description: 반려견 몸무게
 *                        example: "20.9"
 *                      petProfilePicture:
 *                        type: string
 *                        description: 반려견 사진
 *                        example: "bb"
 *                      petSpecies:
 *                        type: Array<string>
 *                        description: 반려견 종들 (1-3종)
 *                        example: ["그레이 하운드"]
 *        responses:
 *          "200":
 *            description: "반려견 정보 수정 성공"
 *          "400":
 *            description: "요청 데이터가 유효하지 않음."
 *          "401":
 *            description: "사용자 인증 실패"
 *          "404":
 *            description: "사용자가 등록한 반려견이 아니거나 반려견 종이 DB에 존재하지 않습니다."
 *          "409":
 *            description: "기존 요소와 동일하거나 수정할 반려견 이름이 사용자가 등록한 반려견의 이름과 중복됩니다."
 *          "500":
 *            description: "서버 내의 문제 발생"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/pet/species:
 *     get:
 *        tags:
 *        - pets
 *        description: "모든 반려견 종 가져오기"
 *        produces:
 *          - "application/json"
 *        responses:
 *          "200":
 *            description: "모든 반려견 종 가져오기 성공"
 *          "400":
 *            description: "모든 반려견 종 가져오기 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.get("/api/pet/getnames", auth, (req, res) => {
  // 사용자가 등록한 pet들 정보 return
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    getUserPets(user.userID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "USER AUTH FAILED",
    });
  }
});

router.post("/api/pet/getinfo", auth, (req: PetRequest<PetIDModel>, res) => {
  // 사용자가 등록한 pet 중
  // 해당 petID pet 정보 return

  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = req.body.petID;
    console.log("🚀 ~ pet", petID);
    if (checkEmptyValue(petID)) {
      return res.status(400).json({
        success: false,
        message: "PARAMETER IS EMPTY",
      });
    }
    getPetInfor(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "USER AUTH FAILED",
    });
  }
});

router.patch(
  "/api/pet/update",
  auth,
  (req: PetRequest<UpdatePetModel>, res) => {
    // 사용자가 등록한 반려견의 정보 중
    // 수정할 부분을 요청으로 보내면
    // 해당 부분에 대해 수정을 진행
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      //object
      const param: UpdatePetInforDTO = req.body;
      console.log("🚀 ~ pet", param);
      if (
        checkEmptyValue(param.petID) ||
        checkEmptyValue(param.updateElement)
      ) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      } else if (
        param.updateElement.petName &&
        checkEmptyValue(param.updateElement.petName)
      )
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      else if (
        param.updateElement.birthDate &&
        checkEmptyValue(param.updateElement.birthDate)
      )
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      else if (
        param.updateElement.petSex &&
        checkEmptyValue(param.updateElement.petSex)
      )
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      else if (
        param.updateElement.weight &&
        checkEmptyValue(param.updateElement.weight)
      )
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      else if (
        param.updateElement.petSpecies &&
        checkEmptyValue(param.updateElement.petSpecies)
      )
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      updatePetInfor(user.userID, param, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

router.get("/api/pet/species", auth, (req, res) => {
  // 사용자가 등록한 pet들 정보 return
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    getAllSpecies(res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "USER AUTH FAILED",
    });
  }
});
export default router;
