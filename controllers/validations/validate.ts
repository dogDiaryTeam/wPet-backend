import { dbCheckPetSpecies } from "../../db/pet.db/create_delete_pet.db";

//null 값 유효성 검사
export function checkEmptyValue(value: any): boolean {
  return typeof value === "undefined" || value === null || value === ""
    ? true
    : false;
}

//email 유효성 검사
export function checkEmail(email: string): boolean {
  let regExp =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regExp.test(email);
}

//name 유효성 검사 (1-15자)
export function checkName(name: string): boolean {
  let regExp = /^.{1,15}$/;
  return regExp.test(name);
}

//pw 유효성 검사 (8-13자)
export function checkPw(pw: string): boolean {
  var regExp =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,13}$/;
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
  let vValue_Num = vValue.replace(/-/g, "");

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
  if (sex === "여" || sex === "남") {
    return true;
  }
  return false;
}

//pet weight 유효성 검사
export function checkPetWeight(weight: number): boolean {
  if (weight <= 0 || weight > 1000) {
    return false;
  }
  return true;
}

//pet species 유효성 검사
export function checkPetSpecies(petSpecies: Array<string>): boolean {
  if (petSpecies.length < 1 || petSpecies.length > 3) {
    return false;
  }
  return true;
}

// string length 유효성 검사
export function checkStringLen(str: string, len: number): boolean {
  // str 길이가 len 을 넘으면 false
  if (str.length > len) {
    return false;
  }
  return true;
}

// array length 유효성 검사
export function checkArrayLen(arr: Array<any>, len: number): boolean {
  // arr 길이가 len 을 넘으면 false
  if (arr.length > len) {
    return false;
  }
  return true;
}

// diary weather 유효성 검사
export function checkDiaryWeather(weather: string): boolean {
  // 추후 수정
  let dbWeather: Array<string> = [
    "sunny",
    "sunny-cloudy",
    "snow",
    "rainy",
    "thunderbolt",
    "rainbow",
    "cloudy",
  ];
  // 포함
  if (dbWeather.indexOf(weather) > -1) {
    return true;
  }
  // 미포함
  return false;
}

// diary hashtags 유효성 검사
export function checkDiaryHashTags(hashTags: Array<string>): boolean {
  // 추후 수정
  let maxNum: number = 30;
  let hashTagsLen: number = hashTags.length;
  for (let i = 0; i < hashTagsLen; i++) {
    if (hashTags[i].length > maxNum) {
      return false;
    }
  }
  return true;
}

// todolist isChheck 유효성 검사
export function checkTodolistIsCheck(isCheck: number): boolean {
  if (isCheck === 0 || isCheck === 1) return true;
  return false;
}
