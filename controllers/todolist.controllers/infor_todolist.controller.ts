import {
  InforTodolistReqDTO,
  UpdateTodolistReqDTO,
} from "../../types/todolist";
import {
  checkDate,
  checkStringLen,
  checkTodolistIsCheck,
} from "../validations/validate";
import {
  dbCheckPetTodolist,
  dbUpdateTodolistCheck,
  dbUpdateTodolistInfo,
} from "../../db/todolist.db/infor_todolist.db";

import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckTodolistKeyword } from "../../db/todolist.db/create_delete_todolist.db";

export const checkTodolist = (
  userID: number,
  petID: number,
  todolistID: number,
  isCheck: number,
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
      // isCheck 유효성 검사
      else if (!checkTodolistIsCheck(isCheck))
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: `INVALID FORMAT : ISCHECK (0 OR 1)`,
        });
      // 체크 UPDATE (완료)
      dbUpdateTodolistCheck(todolistID, isCheck, function (success, err) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // UPDATE 성공
        return res.status(201).json({ success: true });
      });
    });
  });
};

export const updateTodolist = (
  userID: number,
  petID: number,
  todolistID: number,
  updateInfo: UpdateTodolistReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 수정 (리스트 한개)

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
      else {
        // 투두리스트 업데이트 정보 유효성 검사
        let errArr: Array<string> = [];

        if (
          !checkDate(updateInfo.date) ||
          !checkStringLen(updateInfo.content, 255)
        ) {
          if (!checkDate(updateInfo.date)) errArr.push("DATE");
          if (!checkStringLen(updateInfo.content, 255))
            errArr.push("CONTENT LENGTH(1-255)");
        }
        // 투두리스트 키워드 검증
        // DB에 저장된 키워드가 맞는지 검증
        dbCheckTodolistKeyword(
          updateInfo.keyword,
          function (success, err, msg) {
            if (!success && err) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            }
            // 키워드가 유효하지 않음
            else if (!success && !err && msg !== undefined) {
              // 다른 요청들도 유효하지 않은 경우
              if (errArr.length > 0) {
                errArr.push(msg);
                return res.status(400).json({
                  code: "INVALID FORMAT ERROR",
                  errorMessage: `INVALID FORMAT : [${errArr}]`,
                });
              }
              // 키워드만 유효하지 않은 경우
              else
                return res.status(400).json({
                  code: "INVALID FORMAT ERROR",
                  errorMessage: `INVALID FORMAT : ${msg}`,
                });
            }
            // 키워드 정상 + date, content 유효성 오류
            else if (errArr.length > 0) {
              return res.status(400).json({
                code: "INVALID FORMAT ERROR",
                errorMessage: `INVALID FORMAT : [${errArr}]`,
              });
            } else {
              // 모든 요청 정보 정상
              // 정보 UPDATE
              dbUpdateTodolistInfo(
                todolistID,
                updateInfo,
                function (success, err) {
                  if (!success) {
                    return res
                      .status(404)
                      .json({ code: "SQL ERROR", errorMessage: err });
                  }
                  // UPDATE 성공
                  return res.status(201).json({ success: true });
                }
              );
            }
          }
        );
      }
    });
  });
};
