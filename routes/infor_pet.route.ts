import {
  PetIDModel,
  PetInforDTO,
  UpdatePetInforDTO,
  UpdatePetModel,
} from "../types/pet";
import {
  getPetInfor,
  getUserPets,
  updatePetInfor,
} from "../controllers/infor_pet.controller";

import { PetRequest } from "../types/express";
import { Router } from "express";
import { UserInforDTO } from "../types/user";
import { auth } from "../middleware/auth";

const router = Router();

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
      message: "유저 인증에 실패하였습니다.",
    });
  }
});

router.post("/api/pet/getinfor", auth, (req: PetRequest<PetIDModel>, res) => {
  // 사용자가 등록한 pet 중
  // 해당 petName의 pet 정보 return
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = req.body.petID;
    console.log("🚀 ~ pet", petID);
    getPetInfor(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
});

router.post("/api/pet/update", auth, (req: PetRequest<UpdatePetModel>, res) => {
  // 사용자가 등록한 반려견의 정보 중
  // 수정할 부분을 요청으로 보내면
  // 해당 부분에 대해 수정을 진행
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    //object
    const param: UpdatePetInforDTO = req.body;
    console.log("🚀 ~ pet", param);
    updatePetInfor(user.userID, param, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
});
export default router;
