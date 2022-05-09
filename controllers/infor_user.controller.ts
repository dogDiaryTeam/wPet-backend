import { UpdateUserReqDTO, UserInforDTO } from "../types/user";
import { checkLocation, checkName, checkPw } from "./validate";
import {
  dbAuthUserOriginPw,
  dbUpdateUserElement,
  dbUpdateUserNewPw,
} from "../db/infor_user.db";

import { Response } from "express-serve-static-core";
import bcrypt from "bcrypt";
import { dbFindUser } from "../db/create_user.db";

const saltRounds = 10;

export const updateUserPw = (
  originPw: string,
  newPw: string,
  user: UserInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  //비밀번호 변경 (로그인 된 상태)
  //현재 비밀번호 + auth + 새 비밀번호

  //비밀번호 유효성 검증
  if (!checkPw(originPw) || !checkPw(newPw)) {
    let errMsg = "";
    let originPwErr = checkPw(originPw) ? "" : "기존 비밀번호 형식 이상.";
    let newPwErr = checkPw(newPw) ? "" : "새 비밀번호 형식 이상.";
    errMsg = errMsg + originPwErr + newPwErr;
    console.log("errMsg:", errMsg);

    return res.status(400).json({ success: false, message: errMsg });
  }

  //auth 정보와 비밀번호 정보 비교
  dbAuthUserOriginPw(originPw, user, function (success, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    } else if (!success && msg) {
      return res.status(401).json({ success: false, message: msg });
    }
    // 비밀번호 일치
    // 새 비밀번호로 update
    // 암호화
    bcrypt.hash(newPw, saltRounds, (error, hash) => {
      newPw = hash;
      console.log(newPw);

      // DB에 update
      dbUpdateUserNewPw(newPw, user, function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        return res.json({ success: true });
      });
    });
  });
};

//PATCH
export const updateUser = (
  userID: number,
  param: UpdateUserReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  let patchValue: string | undefined;

  let patchKeys: Array<string> = Object.keys(param);
  let patchLength: number = patchKeys.length;
  //key가 하나 이상이라면
  if (patchLength > 1) {
    return res.status(400).json({
      success: false,
      message: "수정 항목의 최대 길이(1)를 초과하는 리스트입니다.",
    });
  }

  //nickName 수정
  if ("nickName" in param) {
    patchValue = param["nickName"];
    console.log("닉네임 있음");
    if (patchValue) updateUserNickName(userID, patchValue, res);
  }
  //profilePicture 수정
  else if ("profilePicture" in param) {
    patchValue = param["profilePicture"];
    //profilePicture 있다면
    console.log("프로필 있음");
    //프로필사진 유효
    if (patchValue) updateUserProfilePicture(userID, patchValue, res);
  }
  //location 수정
  else if ("location" in param) {
    patchValue = param["location"];
    console.log("지역명 있음");
    //지역명 유효
    if (patchValue) updateUserLocation(userID, patchValue, res);
  }
  //그 외 (err)
  else {
    return res.status(400).json({
      success: false,
      message: "수정이 불가능한 항목이 존재합니다.",
    });
  }
};

//user nickName 업데이트
function updateUserNickName(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  //닉네임 유효성 검사 (유효x)
  if (!checkName(patchValue)) {
    return res.status(400).json({
      success: false,
      message: "수정할 닉네임의 형식이 유효하지 않습니다.",
    });
  }
  //(닉네임) 유저가 있는지
  dbFindUser("nickName", patchValue, function (err, isUser, overUser) {
    if (err) {
      return res.status(400).json({ success: false, message: err });
    } else if (isUser) {
      return res.status(409).json({
        success: false,
        message: "해당 닉네임의 유저가 이미 존재합니다.",
      });
    }
    //(닉네임) 유저가 없는 경우
    //닉네임 유효
    dbUpdateUserElement(
      userID,
      "nickName",
      patchValue,
      function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        //update nickName 성공
        else {
          return res.json({ success: true });
        }
      }
    );
  });
}

//user profilePicture 업데이트
function updateUserProfilePicture(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  dbUpdateUserElement(
    userID,
    "profilePicture",
    patchValue,
    function (success, error) {
      if (!success) {
        return res.status(400).json({ success: false, message: error });
      }
      //update profilePicture 성공
      else {
        return res.json({ success: true });
      }
    }
  );
}

//user location 업데이트
function updateUserLocation(
  userID: number,
  patchValue: string,
  res: Response<any, Record<string, any>, number>
) {
  if (!checkLocation(patchValue)) {
    return res.status(400).json({
      success: false,
      message: "수정할 지역명의 형식이 유효하지 않습니다.",
    });
  }
  //지역 유효
  dbUpdateUserElement(
    userID,
    "location",
    patchValue,
    function (success, error) {
      if (!success) {
        return res.status(400).json({ success: false, message: error });
      } else {
        return res.json({ success: true });
      }
    }
  );
}