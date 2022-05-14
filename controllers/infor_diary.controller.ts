import { Response } from "express-serve-static-core";

export const getDiarys = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 사용자가 등록한 pet들 정보 (petID, petName) return
  // dbSelectPets(userID, function (success, result, err, msg) {
  //   if (!success && err) {
  //     return res.status(400).json({ success: false, message: err });
  //   }
  //   // 사용자가 등록한 반려견이 없는 경우
  //   else if (!success && !err) {
  //     return res.status(404).json({ success: false, message: msg });
  //   }
  //   // 사용자가 등록한 반려견이 있는 경우
  //   else if (result) {
  //     return res.json({ success: true, result });
  //   }
  // });
};

export const getOneDiary = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 사용자가 등록한 pet들 정보 (petID, petName) return
  //   dbSelectPets(userID, function (success, result, err, msg) {
  //     if (!success && err) {
  //       return res.status(400).json({ success: false, message: err });
  //     }
  //     // 사용자가 등록한 반려견이 없는 경우
  //     else if (!success && !err) {
  //       return res.status(404).json({ success: false, message: msg });
  //     }
  //     // 사용자가 등록한 반려견이 있는 경우
  //     else if (result) {
  //       return res.json({ success: true, result });
  //     }
  //   });
};
