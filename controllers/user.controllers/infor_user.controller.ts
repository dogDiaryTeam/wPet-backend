import { UpdateUserReqDTO, UserInforDTO } from "../../types/user";
import {
  checkEmail,
  checkLocation,
  checkName,
  checkPw,
} from "../validations/validate";
import {
  dbAuthUserOriginPw,
  dbCompareUpdateUserEmailAuth,
  dbFindDuplicateEmail,
  dbFindUser,
  dbInsertUpdateUserEmailAuth,
  dbSelectUserProfilePictureUrl,
  dbUpdateUserElement,
  dbUpdateUserEmail,
  dbUpdateUserNewPw,
} from "../../db/user.db/infor_user.db";
import {
  dbDeletePictureFile,
  imageController,
} from "../image.controllers/image.controller";

import { Response } from "express-serve-static-core";
import bcrypt from "bcrypt";
import { mailSendAuthUpdateEmail } from "../email.controllers/email.controller";

const saltRounds = 10;

export const updateUserPw = (
  originPw: string,
  newPw: string,
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 비밀번호 변경 (로그인 된 상태)
  // 현재 비밀번호 + auth + 새 비밀번호

  // 비밀번호 유효성 검증
  if (!checkPw(originPw) || !checkPw(newPw)) {
    let errArr: Array<string> = [];
    if (!checkPw(originPw)) errArr.push("OLD PASSWORD");
    if (!checkPw(newPw)) errArr.push("NEW PASSWORD");

    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: `INVALID FORMAT : [${errArr}]`,
    });
  } else if (originPw === newPw)
    return res.status(204).json({
      code: "CONFLICT ERROR",
      errorMessage: "SAME OLD AND NEW PASSWORD",
    });
  // auth 정보와 비밀번호 정보 비교
  dbAuthUserOriginPw(originPw, userID, function (success, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (!success && msg) {
      return res.status(401).json({ code: "AUTH FAILED", errorMessage: msg });
    }
    // 비밀번호 일치
    // 새 비밀번호로 update
    // 암호화
    bcrypt.hash(newPw, saltRounds, (error, hash) => {
      newPw = hash;

      // DB에 update
      dbUpdateUserNewPw(newPw, userID, function (success, error) {
        if (!success) {
          return res
            .status(404)
            .json({ code: "SQL ERROR", errorMessage: error });
        }
        return res.status(201).json({ success: true });
      });
    });
  });
};

export const sendAuthUserUpdateEmail = (
  userID: number,
  originEmail: string,
  newEmail: string,
  res: Response<any, Record<string, any>, number>
) => {
  // 이메일 변경 (로그인 된 상태)
  // 이메일 인증 번호 전송

  // 새 이메일 유효성 검증
  if (!checkEmail(newEmail))
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID FORMAT : EMAIL",
    });
  else if (originEmail === newEmail)
    return res.status(204).json({
      code: "CONFLICT ERROR",
      errorMessage: "SAME OLD AND NEW EMAIL",
    });

  // (이메일) 유저가 있는지
  dbFindDuplicateEmail(newEmail, function (err, isUser, isAuth) {
    if (err)
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    else if (isUser)
      return res
        .status(409)
        .json({ code: "CONFLICT ERROR", errorMessage: "DUPLICATE EMAIL" });

    // 이메일 중복 안되는 경우 == 변경 가능
    // 이메일 업데이트를 위한 이메일 인증 메일 발송
    let authString: string = String(Math.random().toString(36).slice(2, 10));
    dbInsertUpdateUserEmailAuth(
      userID,
      newEmail,
      authString,
      function (success, err) {
        if (!success)
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        //인증번호 부여 성공
        //인증번호를 담은 메일 전송
        mailSendAuthUpdateEmail(newEmail, authString, res);
      }
    );
  });
};

export const compareAuthUserUpdateEmail = (
  userID: number,
  newEmail: string,
  authString: string,
  res: Response<any, Record<string, any>, number>
) => {
  // 이메일 변경 (로그인 된 상태)
  // 인증 번호 동일 => 이메일 변경

  // 이메일 인증번호 검증
  dbCompareUpdateUserEmailAuth(
    userID,
    newEmail,
    authString,
    function (success, error, dbAuthString) {
      if (!success) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: error });
      }
      //부여된 인증번호가 없는 경우
      else if (!dbAuthString) {
        return res
          .status(404)
          .json({ code: "AUTH FAILED", errorMessage: "AUTH TIMEOUT" });
      } else {
        //인증번호 동일
        if (dbAuthString === authString) {
          // 이메일 업데이트
          dbUpdateUserEmail(userID, newEmail, function (success, error) {
            if (!success)
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: error });
            else return res.status(201).json({ success: true });
          });
        }
        //인증번호 동일 x
        else {
          return res.status(401).json({
            code: "AUTH FAILED",
            errorMessage: "AUTH CODE IS MISMATCH",
          });
        }
      }
    }
  );
};

//PATCH
export const updateUser = (
  userID: number,
  userNickName: string,
  userProfilePicture: string | null,
  userLocation: string | null,
  param: UpdateUserReqDTO,
  res: Response<any, Record<string, any>, number>
) => {
  let patchValue: string | undefined | null;

  let patchKeys: Array<string> = Object.keys(param);
  let patchLength: number = patchKeys.length;
  //key가 하나 이상이라면
  if (patchLength > 1) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "MAX NUMBER OF KEYS : 1",
    });
  }

  //nickName 수정
  if ("nickName" in param) {
    patchValue = param["nickName"];

    if (patchValue === userNickName)
      return res.status(204).json({
        code: "CONFLICT ERROR",
        errorMessage: "SAME OLD AND NEW NICKNAME",
      });
    else if (patchValue) updateUserNickName(userID, patchValue, res);
  }
  //profilePicture 수정
  else if ("photo" in param) {
    patchValue = param["photo"];
    // 프로필 사진 은 빈값일 수 있음
    patchValue = patchValue === "" ? null : patchValue;
    //profilePicture 있다면

    if (patchValue === userProfilePicture)
      return res.status(204).json({
        code: "CONFLICT ERROR",
        errorMessage: "SAME OLD AND NEW PHOTO",
      });
    else if (patchValue || patchValue === null)
      updateUserProfilePicture(userID, patchValue, res);
  }
  //location 수정
  else if ("location" in param) {
    patchValue = param["location"];
    // 지역 은 빈값일 수 있음
    patchValue = patchValue === "" ? null : patchValue;

    //지역명 유효
    if (patchValue === userLocation)
      return res.status(204).json({
        code: "CONFLICT ERROR",
        errorMessage: "SAME OLD AND NEW LOCATION",
      });
    else if (patchValue || patchValue === null)
      updateUserLocation(userID, patchValue, res);
  }
  //그 외 (err)
  else {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID KEY INCLUDED",
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
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID FORMAT : NICKNAME",
    });
  }
  //(닉네임) 유저가 있는지
  dbFindUser("nickName", patchValue, function (err, isUser, overUser) {
    if (err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (isUser) {
      return res.status(409).json({
        code: "CONFLICT ERROR",
        errorMessage: "DUPLICATE NICKNAME",
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
          return res
            .status(404)
            .json({ code: "SQL ERROR", errorMessage: error });
        }
        //update nickName 성공
        else {
          return res.status(201).json({ success: true });
        }
      }
    );
  });
}

//user profilePicture 업데이트
function updateUserProfilePicture(
  userID: number,
  patchValue: string | null,
  res: Response<any, Record<string, any>, number>
) {
  // 기존 사용자 사진 파일의 url 가져오기
  dbSelectUserProfilePictureUrl(userID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 존재하지 않는 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    } else {
      // result == 기존 사용자 사진 파일의 url (OR null)
      // 해당 파일 삭제
      dbDeletePictureFile(result, function (success, error) {
        if (!success) {
          return res
            .status(404)
            .json({ code: "DELETE IMAGE FILE ERROR", errorMessage: error });
        }
        // 파일 삭제 완료
        // 수정할 이미지 데이터 -> 새로운 파일에 삽입
        // 이미지 파일 컨트롤러
        imageController(patchValue, function (success, imageFileUrl, error) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "WRITE IMAGE FILE ERROR", errorMessage: error });
          }
          // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장
          // else if (imageFileUrl) {
          patchValue = imageFileUrl;

          dbUpdateUserElement(
            userID,
            "profilePicture",
            patchValue,
            function (success, error) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: error });
              }
              //update profilePicture 성공
              else {
                return res.status(201).json({ success: true });
              }
            }
          );
        });
      });
    }
  });
}

//user location 업데이트
function updateUserLocation(
  userID: number,
  patchValue: string | null,
  res: Response<any, Record<string, any>, number>
) {
  if (patchValue && !checkLocation(patchValue)) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "INVALID FORMAT : LOCATION",
    });
  }
  //지역 유효
  dbUpdateUserElement(
    userID,
    "location",
    patchValue,
    function (success, error) {
      if (!success) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: error });
      } else {
        return res.status(201).json({ success: true });
      }
    }
  );
}
