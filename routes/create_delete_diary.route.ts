import {
  CreateDiaryModel,
  DeleteDiaryModel,
  DiaryInforDTO,
} from "../types/diary";
import {
  createDiary,
  deletePet,
} from "../controllers/create_delete_diary.controller";

import { DiaryRequest } from "../types/express";
import { Router } from "express";
import { UserInforDTO } from "../types/user";
import { auth } from "../middleware/auth";

const router = Router();

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
      createDiary(user.userID, diary, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        isAuth: false,
        message: "유저 인증에 실패하였습니다.",
      });
    }
  }
);

router.post(
  "/api/diary/delete",
  auth,
  (req: DiaryRequest<DeleteDiaryModel>, res) => {
    // 특정 id 다이어리 삭제
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const diaryID: number = req.body.diaryID;
      console.log("🚀 ~ diaryID", diaryID);
      deletePet(diaryID, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        isAuth: false,
        message: "유저 인증에 실패하였습니다.",
      });
    }
  }
);

export default router;
