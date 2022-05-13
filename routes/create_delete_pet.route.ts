import { CreatePetModel, PetInforDTO, PetNameModel } from "../types/pet";
import {
  createPet,
  deletePet,
} from "../controllers/create_delete_pet.controller";

import { PetRequest } from "../types/express";
import { Router } from "express";
import { UserInforDTO } from "../types/user";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/api/pet/create", auth, (req: PetRequest<CreatePetModel>, res) => {
  // 펫 등록 할때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const pet: PetInforDTO = req.body;
    console.log("🚀 ~ pet", pet);
    console.log("🚀 ~ req.body", req.body);
    createPet(user.userID, pet, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
});

router.post("/api/pet/delete", auth, (req: PetRequest<PetNameModel>, res) => {
  // petName에 해당하는 펫을 삭제
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petName: string = req.body.petName;
    console.log("🚀 ~ pet", petName);
    deletePet(user.userID, petName, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
});

export default router;
