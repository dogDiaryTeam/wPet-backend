import { CreateShowerDTO, CreateShowerModel } from "../../types/shower";

import { Router } from "express";
import { ShowerRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { deleteBeautyData } from "../../controllers/beauty.controllers/delete_beauty.controller";
import { deleteMedicineData } from "../../controllers/medicine.controllers/delete_medicine.controller";
import { deleteShowerData } from "../../controllers/shower.controllers/delete_shower.controller";
import { registerShowerData } from "../../controllers/shower.controllers/register_shower.controller";

const router = Router();

router.delete("/pets/:petId/medicines/:medicineId", auth, (req, res) => {
  // 반려견의 약 데이터를 삭제
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);
    const medicineID: number = Number(req.params.medicineId);

    if (checkEmptyValue(petID) || checkEmptyValue(medicineID)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    deleteMedicineData(user.userID, petID, medicineID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
