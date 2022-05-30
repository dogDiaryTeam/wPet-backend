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
    let errMsg = "";
    let originPwErr = checkPw(originPw) ? "" : "기존 비밀번호 형식 이상.";
    let newPwErr = checkPw(newPw) ? "" : "새 비밀번호 형식 이상.";
    errMsg = errMsg + originPwErr + newPwErr;

    return res.status(400).json({ success: false, message: errMsg });
  } else if (originPw === newPw)
    return res
      .status(409)
      .json({ success: false, message: "기존 비밀번호와 동일합니다." });
  // auth 정보와 비밀번호 정보 비교
  dbAuthUserOriginPw(originPw, userID, function (success, err, msg) {
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

      // DB에 update
      dbUpdateUserNewPw(newPw, userID, function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        return res.json({ success: true });
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
    return res
      .status(400)
      .json({ success: false, message: "새 이메일 형식 이상." });
  else if (originEmail === newEmail)
    return res
      .status(409)
      .json({ success: false, message: "기존 이메일과 동일합니다." });

  // (이메일) 유저가 있는지
  dbFindDuplicateEmail(newEmail, function (err, isUser, isAuth) {
    if (err)
      return res
        .status(400)
        .json({ success: false, message: "이메일이 유효하지 않습니다." });
    else if (isUser)
      return res.status(409).json({ success: false, message: "이메일 중복." });

    // 이메일 중복 안되는 경우 == 변경 가능
    // 이메일 업데이트를 위한 이메일 인증 메일 발송
    let authString: string = String(Math.random().toString(36).slice(2, 10));
    dbInsertUpdateUserEmailAuth(
      userID,
      newEmail,
      authString,
      function (success, err) {
        if (!success)
          return res.status(400).json({ success: false, message: err });
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
        return res.status(400).json({ success: false, message: error });
      }
      //부여된 인증번호가 없는 경우
      else if (!dbAuthString) {
        return res
          .status(404)
          .json({ success: false, message: "부여된 인증번호가 없습니다." });
      } else {
        //인증번호 동일
        if (dbAuthString === authString) {
          // 이메일 업데이트
          dbUpdateUserEmail(userID, newEmail, function (success, error) {
            if (!success)
              return res.status(400).json({ success: false, message: error });
            else return res.json({ success: true });
          });
        }
        //인증번호 동일 x
        else {
          return res.status(401).json({
            success: false,
            message: "인증번호가 일치하지 않습니다.",
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
      success: false,
      message: "수정 항목의 최대 길이(1)를 초과하는 리스트입니다.",
    });
  }

  //nickName 수정
  if ("nickName" in param) {
    patchValue = param["nickName"];

    if (patchValue === userNickName)
      return res.status(409).json({
        success: false,
        message: "기존 닉네임과 동일합니다.",
      });
    else if (patchValue) updateUserNickName(userID, patchValue, res);
  }
  //profilePicture 수정
  else if ("profilePicture" in param) {
    patchValue = param["profilePicture"];
    // 프로필 사진 은 빈값일 수 있음
    patchValue = patchValue === "" ? null : patchValue;
    //profilePicture 있다면

    if (patchValue === userProfilePicture)
      return res.status(409).json({
        success: false,
        message: "기존 프로필 사진과 동일합니다.",
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
      return res.status(409).json({
        success: false,
        message: "기존 지역과 동일합니다.",
      });
    else if (patchValue || patchValue === null)
      updateUserLocation(userID, patchValue, res);
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
  patchValue: string | null,
  res: Response<any, Record<string, any>, number>
) {
  // 기존 사용자 사진 파일의 url 가져오기
  dbSelectUserProfilePictureUrl(userID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 존재하지 않는 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    } else {
      // result == 기존 사용자 사진 파일의 url (OR null)
      // 해당 파일 삭제
      dbDeletePictureFile(result, function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        // 파일 삭제 완료
        // 수정할 이미지 데이터 -> 새로운 파일에 삽입
        // 이미지 파일 컨트롤러
        imageController(patchValue, function (success, imageFileUrl, error) {
          if (!success) {
            return res.status(400).json({ success: false, message: error });
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
                return res.status(400).json({ success: false, message: error });
              }
              //update profilePicture 성공
              else {
                return res.json({ success: true });
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
