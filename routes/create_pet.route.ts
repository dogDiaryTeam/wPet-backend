import { CreatePetModel, PetInforDTO } from "../types/pet";

import { PetRequest } from "../types/express";
import { Router } from "express";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/api/pet/create", auth, (req: PetRequest<CreatePetModel>, res) => {
  // 펫 등록 할때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  const pet: PetInforDTO = req.body;
  console.log("🚀 ~ pet", pet);
  console.log("🚀 ~ req.body", req.body);
  //   creatUser(user, res);
});
