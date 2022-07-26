import { checkDate, checkStringLen, checkTime } from "../validations/validate";
import {
  dbCheckPetTodolist,
  dbSelectTodolistKeyword,
} from "../../db/todolist.db/infor_todolist.db";
import {
  dbDeleteTodolist,
  dbInsertTodolist,
} from "../../db/todolist.db/create_delete_todolist.db";

import { CreateTodolistReqDTO } from "../../types/todolist";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckTodolistKeyword } from "../../db/todolist_keyword.db/infor_todolist_keyword.db";
import { dbUpdatePetBeautyLastDate } from "../../db/beauty.db/register_beauty.db";
import { dbUpdatePetShowerLastDate } from "../../db/shower.db/register_shower.db";

export const createTodolist = (
  userID: number,
  todolist: CreateTodolistReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 등록 (반려견 한마리 당)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, todolist.petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // 사용자의 반려견이 맞는 경우

    // 투두리스트 정보 유효성 검사
    let errArr: Array<string> = [];

    if (
      !checkDate(todolist.date) ||
      !checkStringLen(todolist.content, 255) ||
      (todolist.time !== null && !checkTime(todolist.time))
    ) {
      if (!checkDate(todolist.date)) errArr.push("DATE");
      if (!checkStringLen(todolist.content, 255))
        errArr.push("CONTENT LENGTH(1-255)");
      if (todolist.time !== null && !checkTime(todolist.time))
        errArr.push("TIME FORMAT");
    }
    // 투두리스트 키워드 검증
    // DB에 저장된 키워드가 맞는지 검증
    dbCheckTodolistKeyword(todolist.keyword, function (success, err, msg) {
      if (!success && err) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
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
      // 키워드 정상
      else if (errArr.length > 0) {
        // date, content 유효성 오류
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: `INVALID FORMAT : [${errArr}]`,
        });
      } else {
        // 투두리스트 작성
        dbInsertTodolist(
          todolist.petID,
          todolist.date,
          todolist.content,
          todolist.keyword,
          todolist.time,
          function (success, err) {
            if (!success)
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            else return res.status(201).json({ success: true });
          }
        );
      }
    });
  });
};

export const deleteTodolist = (
  userID: number,
  petID: number,
  todolistID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 삭제
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
      // keyword 가져오기
      dbSelectTodolistKeyword(
        todolistID,
        function (success, err, todolistKeyword) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          }
          // 삭제
          dbDeleteTodolist(todolistID, function (success, err) {
            if (!success) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            } else {
              // 키워드가 Shower라면
              if (todolistKeyword === "Shower") {
                // 키워드가 Shower라면
                // lastDate UPDATE
                dbUpdatePetShowerLastDate(petID, function (success, err) {
                  if (!success) {
                    return res.status(404).json({
                      code: "SQL ERROR",
                      errorMessage: err,
                    });
                  } else return res.json({ success: true });
                });
              } else if (todolistKeyword === "Beauty") {
                // 키워드가 Beauty라면
                // lastDate UPDATE
                dbUpdatePetBeautyLastDate(petID, function (success, err) {
                  if (!success) {
                    return res.status(404).json({
                      code: "SQL ERROR",
                      errorMessage: err,
                    });
                  } else return res.json({ success: true });
                });
              } else return res.json({ success: true });
            }
          });
        }
      );
    });
  });
};
