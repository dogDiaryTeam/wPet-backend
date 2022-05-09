//email 유효성 검사
export function checkEmail(email: string) {
  let regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regExp.test(email);
}

//name 유효성 검사 (1-15자)
export function checkName(name: string) {
  let regExp = /^.{1,15}$/;
  return regExp.test(name);
}

//pw 유효성 검사 (8-13자)
export function checkPw(pw: string) {
  var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,13}$/;
  return regExp.test(pw);
}

// //profilePicture 유효성 검사 (1-10자)
// function checkLocation(location: string) {
//   var regExp = /^.{1,10}$/;
//   return regExp.test(location);
// }

//location 유효성 검사 (1-15자)
export function checkLocation(location: string) {
  var regExp = /^.{1,15}$/;
  return regExp.test(location);
}
