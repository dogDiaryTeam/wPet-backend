interface CreateBeautyModel extends mongoose.Document {
  petID: number;
  lastDate: Date;
  cycleDay: number;
  salon: string | null;
}

export interface CreateBeautyDTO {
  petID: number;
  lastDate: Date;
  cycleDay: number;
  salon: string | null;
}

export interface InfoBeautyDataDTO {
  beautyDiaryID: number;
  petID: number;
  lastDate: Date;
  cycleDay: number;
  dueDate: Date;
  salon: string | null;
}
