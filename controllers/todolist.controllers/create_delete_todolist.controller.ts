import {
  CreateTodolistReqDTO,
  InforTodolistReqDTO,
} from "../../types/todolist";
import { checkDate, checkStringLen } from "../validations/validate";
import {
  dbCheckTodolistKeyword,
  dbInsertTodolist,
} from "../../db/todolist.db/create_delete_todolist.db";

import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckPetIDs } from "../../db/diary.db/create_delete_diary.db";

export const createTodolist = (
  userID: number,
  todolist: CreateTodolistReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 등록 (반려견 한마리 당)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, todolist.petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // 사용자의 반려견이 맞는 경우

    // 투두리스트 정보 유효성 검사
    if (
      !checkDate(todolist.listDate) ||
      !checkStringLen(todolist.content, 255)
    ) {
      let errMsg = "";
      let todolistDateErr = checkDate(todolist.listDate)
        ? ""
        : "투두리스트 날짜 이상.";
      let todolistContentLenErr = checkStringLen(todolist.content, 255)
        ? ""
        : "투두리스트 내용 길이 이상[1-255].";

      errMsg = errMsg + todolistDateErr + todolistContentLenErr;

      return res.status(400).json({ success: false, message: errMsg });
    } else {
      // 투두리스트 키워드 검증
      // DB에 저장된 키워드가 맞는지 검증
      dbCheckTodolistKeyword(todolist.keyword, function (success, err, msg) {
        if (!success && err) {
          return res.status(400).json({ success: false, message: err });
        }
        // 키워드가 유효하지 않음
        else if (!success && !err) {
          return res.status(404).json({ success: false, message: msg });
        }
        // 키워드 정상
        // 투두리스트 작성
        dbInsertTodolist(
          todolist.petID,
          todolist.listDate,
          todolist.content,
          todolist.keyword,
          function (success, err) {
            if (!success)
              return res.status(400).json({ success: false, message: err });
            return res.json({ success: true });
          }
        );
      });
    }
  });
};

export const deleteTodolist = (
  userID: number,
  todolist: InforTodolistReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 등록 (반려견 한마리 당)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, todolist.petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // 사용자의 반려견이 맞는 경우
  });
};
