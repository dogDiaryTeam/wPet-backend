import {
  dbCheckPetTodolist,
  dbUpdateTodolistCheck,
} from "../../db/todolist.db/infor_todolist.db";

import { InforTodolistReqDTO } from "../../types/todolist";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";

export const checkTodolist = (
  userID: number,
  petID: number,
  todolistID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 체크 (리스트 한개)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // 사용자의 반려견이 맞는 경우
    // 반려견의 투두리스트 목록이 맞는지 검증
    dbCheckPetTodolist(petID, todolistID, function (success, err, msg) {
      if (!success && err) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
      }
      // 반려견의 투두리스트가 아닌 경우
      else if (!success && !err) {
        return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
      }
      // 반려견의 투두리스트가 맞는 경우
      // 체크 UPDATE (완료)
      dbUpdateTodolistCheck(todolistID, function (success, err) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // UPDATE 성공
        return res.status(201).json({ success: true });
      });
    });
  });
};
