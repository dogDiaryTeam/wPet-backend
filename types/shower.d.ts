interface CreateShowerModel extends mongoose.Document {
  petID: number;
  lastDate: Date;
  cycleDay: number;
}

export interface CreateShowerDTO {
  petID: number;
  lastDate: Date;
  cycleDay: number;
}

export interface InfoShowerDataDTO {
  showerDiaryID: number;
  petID: number;
  lastDate: Date;
  cycleDay: number;
  dueDate: Date;
}
