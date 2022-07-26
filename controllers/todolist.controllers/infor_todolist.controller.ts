import {
  InforUserPetsTodolistDTO,
  UpdateTodolistReqDTO,
} from "../../types/todolist";
import {
  checkDate,
  checkMonth,
  checkStringLen,
  checkTime,
  checkYear,
  checkZeroOrOne,
} from "../validations/validate";
import {
  dbCheckPetTodolist,
  dbSelectPetTodolistsInfo,
  dbSelectUserPetsTodolistsInfo,
  dbUpdateTodolistCheck,
  dbUpdateTodolistInfo,
} from "../../db/todolist.db/infor_todolist.db";

import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckTodolistKeyword } from "../../db/todolist_keyword.db/infor_todolist_keyword.db";
import { dbSelectPetsIdName } from "../../db/pet.db/infor_pet.db";
import { dbUpdatePetBeautyLastDate } from "../../db/beauty.db/register_beauty.db";
import { dbUpdatePetShowerLastDate } from "../../db/shower.db/register_shower.db";

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
      else if (!checkZeroOrOne(isCheck))
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: `INVALID FORMAT : ISCHECK (0 OR 1)`,
        });
      // 체크 UPDATE (완료)
      dbUpdateTodolistCheck(
        todolistID,
        isCheck,
        function (success, err, keyword) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else {
            if (keyword === "Shower") {
              // 키워드가 Shower라면
              // lastDate UPDATE
              dbUpdatePetShowerLastDate(petID, function (success, err) {
                if (!success) {
                  return res.status(404).json({
                    code: "SQL ERROR",
                    errorMessage: err,
                  });
                } else return res.status(201).json({ success: true });
              });
            } else if (keyword === "Beauty") {
              // 키워드가 Beauty라면
              // lastDate UPDATE
              dbUpdatePetBeautyLastDate(petID, function (success, err) {
                if (!success) {
                  return res.status(404).json({
                    code: "SQL ERROR",
                    errorMessage: err,
                  });
                } else return res.status(201).json({ success: true });
              });
            } else return res.status(201).json({ success: true });
          }
        }
      );
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
          !checkStringLen(updateInfo.content, 255) ||
          (updateInfo.time !== null && !checkTime(updateInfo.time))
        ) {
          if (!checkDate(updateInfo.date)) errArr.push("DATE");
          if (!checkStringLen(updateInfo.content, 255))
            errArr.push("CONTENT LENGTH(1-255)");
          if (updateInfo.time !== null && !checkTime(updateInfo.time))
            errArr.push("TIME FORMAT");
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
            // 키워드 정상 + date, content, time 유효성 오류
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
                  else return res.status(201).json({ success: true });
                }
              );
            }
          }
        );
      }
    });
  });
};

export const getUserPetsTodolist = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 사용자가 등록한 반려견들의
  // 투두리스트 목록 반환 (오늘, 내일)

  // 사용자가 등록한 펫들 가져오기
  dbSelectPetsIdName(userID, function (success, pets, err) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (pets !== null && pets.length > 0) {
      let petIDs: Array<number> = pets.map((pet) => pet.petID);

      dbSelectUserPetsTodolistsInfo(
        petIDs,
        function (success, err, todoLists, today, tomorrow) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else if (todoLists !== undefined) {
            let result: Array<InforUserPetsTodolistDTO> = [];
            let petLen: number = pets.length;

            for (let i = 0; i < petLen; i++) {
              result.push({
                petID: petIDs[i],
                name: pets[i].name,
                todays: todoLists[petIDs[i]]["todays"],
                tomorrows: todoLists[petIDs[i]]["tomorrows"],
              });
            }
            return res.json({ today, tomorrow, result });
          }
        }
      );
    }
    // 반려견 등록을 하지 않은 유저
    else return res.json({ result: [] });
  });
};

/*
[ {petid:1, todays:[{todolistis:1, ...},..], tomorrows:[]}, {petid:2, ..}]
*/

export const getPetTodolist = (
  userID: number,
  petID: number,
  year: number,
  month: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 해당 반려견의 연-월 투두리스트 가져오기

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
    // year, month 데이터 유효성 검증
    else if (!checkYear(year) || !checkMonth(month)) {
      let errArr: Array<string> = [];
      if (!checkYear(year)) errArr.push("YEAR");
      if (!checkMonth(month)) errArr.push("MONTH");

      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: `INVALID FORMAT : [${errArr}]`,
      });
    } else {
      let newMonth: string =
        month < 10 ? "0" + month.toString() : month.toString();
      // 해당 반려견의 투두리스트들 중 year, month에 해당하는 목록들 반환
      dbSelectPetTodolistsInfo(
        petID,
        year,
        newMonth,
        function (success, err, result) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else return res.json({ result });
        }
      );
    }
  });
};
