interface CreateBeautyModel extends mongoose.Document {
  petID: number;
  cycleDay: number;
  salon: string | null;
}

export interface CreateBeautyDTO {
  petID: number;
  cycleDay: number;
  salon: string | null;
}

export interface InfoBeautyDataDTO {
  beautyDiaryID: number;
  petID: number;
  lastDate: Date | null;
  cycleDay: number;
  dueDate: Date | null;
  salon: string | null;
}
