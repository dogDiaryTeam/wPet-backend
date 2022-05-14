interface CreateDiaryModel extends mongoose.Document {
  petIDs: Array<number>;
  title: string;
  picture: string;
  texts: string;
  shareIs: number;
  petState: string;
  weather: string;
  color: string;
  font: string;
  hashTags: Array<string>;
}

interface DeleteDiaryModel extends mongoose.Document {
  diaryID: number;
}

export interface DiaryInforDTO {
  petIDs: Array<number>;
  title: string;
  picture: string;
  texts: string;
  shareIs: number;
  petState: string;
  weather: string;
  color: string;
  font: string;
  hashTags: Array<string>;
}
