interface CreateDiaryModel extends mongoose.Document {
  petIDs: Array<number>;
  title: string;
  photo: string | null;
  texts: string;
  isShare: number;
  petState: string;
  weather: string;
  color: string;
  font: string;
  hashTags: Array<string>;
}

interface PetDiaryModel extends mongoose.Document {
  petID: number;
  diaryID: number;
}

interface PetAllDiaryModel extends mongoose.Document {
  petID: number;
}

export interface DiaryInforDTO {
  petIDs: Array<number>;
  title: string;
  photo: string | null;
  texts: string;
  isShare: number;
  petState: string;
  weather: string;
  color: string;
  font: string;
  hashTags: Array<string>;
}

export interface DbSelectUserAllDiarysDTO {
  diaryID: number;
  petID: number;
  date: Date;
  photo: string | null;
}

// photo 수정
// export interface UserOneDiaryDTO {
//   diaryID: number;
//   petID: number;
//   photo: string | null;
// }

// export interface UserAllDiarysDTO {
//   date: Date;
//   diarys: Array<UserOneDiaryDTO>;
// }

export interface DbSelectPetAllDiarysDTO {
  diaryID: number;
  petID: number;
  date: Date;
  title: string;
  photo: string | null;
  color: string;
  font: string;
}

export interface DbSelectDiaryDTO {
  diaryID: number;
  petID: number;
  date: Date;
  title: string;
  photo: string | null;
  texts: string;
  isShare: number;
  petState: string;
  weather: string;
  albumPick: number;
  color: string;
  font: string;
  hashTagNames: string | Array<string>;
}

export interface TodayDiaryWritablePetDTO {
  petID: number;
  name: string;
  writable: boolean;
}
