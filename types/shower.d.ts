interface CreateShowerModel extends mongoose.Document {
  petID: number;
  cycleDay: number;
}

export interface CreateShowerDTO {
  petID: number;
  cycleDay: number;
}

export interface InfoShowerDataDTO {
  showerDiaryID: number;
  petID: number;
  lastDate: Date | null;
  cycleDay: number;
  dueDate: Date | null;
}
