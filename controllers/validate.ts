import { dbCheckPetSpecies } from "../db/create_pet.db";

//email 유효성 검사
export function checkEmail(email: string): boolean {
  let regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regExp.test(email);
}

//name 유효성 검사 (1-15자)
export function checkName(name: string): boolean {
  let regExp = /^.{1,15}$/;
  return regExp.test(name);
}

//pw 유효성 검사 (8-13자)
export function checkPw(pw: string): boolean {
  var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,13}$/;
  return regExp.test(pw);
}

// //profilePicture 유효성 검사 (1-10자)
// function checkLocation(location: string) {
//   var regExp = /^.{1,10}$/;
//   return regExp.test(location);
// }

//location 유효성 검사 (1-15자)
export function checkLocation(location: string): boolean {
  var regExp = /^.{1,15}$/;
  return regExp.test(location);
}

//date 유효성 검사
export function checkDate(date: Date): boolean {
  let dateStr = date.toString();
  let vValue = dateStr;
  let vValue_Num = vValue.replace(/[^0-9]/g, "");

  //8자리가 아닌 경우 false
  if (vValue_Num.length != 8) {
    return false;
  }

  let rxDatePattern = /^(\d{4})(\d{1,2})(\d{1,2})$/;
  let dtArray = vValue_Num.match(rxDatePattern);

  if (dtArray == null) {
    return false;
  }

  //0번째는 원본 , 1번째는 yyyy(년) , 2번재는 mm(월) , 3번재는 dd(일)
  let dtYear = Number(dtArray[1]);
  let dtMonth = Number(dtArray[2]);
  let dtDay = Number(dtArray[3]);

  //yyyymmdd 체크
  if (dtMonth < 1 || dtMonth > 12) return false;
  else if (dtDay < 1 || dtDay > 31) return false;
  else if (
    (dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) &&
    dtDay == 31
  )
    return false;
  else if (dtMonth == 2) {
    let isleap = dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0);
    if (dtDay > 29 || (dtDay == 29 && !isleap)) return false;
  }
  return true;
}

//sex 유효성 검사
export function checkSex(sex: string): boolean {
  if (sex === "여자" || sex === "남자") {
    return true;
  }
  return false;
}
