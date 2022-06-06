import { dbSelectPetProfilePictureUrl } from "../../db/pet.db/infor_pet.db";
import fs from "fs";

// 이미지 로직 처리
// 이미지 데이터 -> text 파일로 "images/" 폴더에 저장
// 저장 경로를 DB에 저장
export function imageController(
  imageData: string | null | undefined,
  callback: (
    success: boolean,
    imageFileUrl: string | null,
    error?: NodeJS.ErrnoException
  ) => void
): any {
  if (imageData === null || imageData === undefined) {
    callback(true, null);
  } else {
    // 파일명은 랜덤함수 -> 이미 있는 파일인지 확인 후, 있다면 다시 랜덤 (안겹치게)
    let authString: string = String(Math.random().toString(36).slice(2));
    let fileName: string = `./images/${authString}.txt`;

    // 해당 파일명이 이미 존재하는지 검증
    let overFile: boolean = fs.existsSync(fileName);

    //이미 존재 -> 랜덤 문자열 다시 생성
    while (overFile) {
      authString = String(Math.random().toString(36).slice(2));
      fileName = `./images/${authString}.txt`;
      // 해당 파일명이 이미 존재하는지 검증
      overFile = fs.existsSync(fileName);
    }
    // 존재 X
    // 파일 생성 후 이미지 데이터 삽입

    return fs.writeFile(fileName, imageData, "utf8", (err) => {
      if (err) callback(false, null, err);
      else callback(true, fileName);
    });
  }
}

// (기존) 사진파일 삭제하기
export function dbDeletePictureFile(
  fileUrl: string | null,
  callback: (success: boolean, error?: NodeJS.ErrnoException) => void
): any {
  if (fileUrl === null) {
    callback(true);
  } else {
    // url에 파일이 존재하는지 확인
    let overFile: boolean = fs.existsSync(fileUrl);

    if (overFile) {
      // url에 위치한 파일 삭제하기
      console.log("파일 삭제");
      fs.unlink(fileUrl, (err) => {
        if (err) callback(false, err);
        else callback(true);
      });
    } else {
      console.log("파일 삭제 안함");
      callback(true);
    }
  }
}

// 사진파일 가져오기
export function dbSelectPictureFile(
  fileUrl: string | null,
  callback: (
    success: boolean,
    result: string | null,
    error: NodeJS.ErrnoException | null,
    message?: string
  ) => void
): any {
  if (fileUrl === null) {
    callback(true, null, null);
  } else {
    // url에 파일이 존재하는지 확인
    let overFile: boolean = fs.existsSync(fileUrl);

    if (overFile) {
      // url에 위치한 파일 내용 가져오기
      fs.readFile(fileUrl, (err, data) => {
        if (err) callback(false, null, err);
        else callback(true, data.toString(), null);
      });
    } else {
      callback(false, null, null, "IMAGE FILE NOT FOUND");
    }
  }
}

// 사진파일들 가져오기
export function dbSelectPictureFiles(
  fileUrls: Array<string | null>,
  callback: (result: Array<string>) => void
): any {
  let fileLen: number = fileUrls.length;
  let newFiles: Array<string> = [];
  let file: string | null;

  let data;
  for (let i = 0; i < fileLen; i++) {
    file = fileUrls[i];
    // url에 파일이 존재하는지 확인
    if (file && fs.existsSync(file)) {
      // url에 위치한 파일 내용 가져오기
      data = fs.readFileSync(file);
      newFiles.push(data.toString());
    } else {
      newFiles.push("");
    }
  }
  callback(newFiles);
}
