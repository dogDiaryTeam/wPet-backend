interface CreateDiaryModel extends mongoose.Document {
  petIDs: Array<number>;
  title: string;
  picture: string | null;
  texts: string;
  shareIs: number;
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
  picture: string | null;
  texts: string;
  shareIs: number;
  petState: string;
  weather: string;
  color: string;
  font: string;
  hashTags: Array<string>;
}
