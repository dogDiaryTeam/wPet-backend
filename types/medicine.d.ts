interface CreateMedicineModel extends mongoose.Document {
  petID: number;
  lastDate: Date | null;
  cycleDay: number | null;
  medicine: string;
  memo: string | null;
  isAlarm: number;
}

export interface CreateMedicineDTO {
  petID: number;
  lastDate: Date | null;
  cycleDay: number | null;
  medicine: string;
  memo: string | null;
  isAlarm: number;
}

export interface InfoMedicineDataDTO {
  medicineDiaryID: number;
  petID: number;
  lastDate: Date | null;
  cycleDay: number | null;
  dueDate: Date | null;
  medicine: string;
  memo: string | null;
  isAlarm: number;
}

export interface InfoMedicineIDNameDTO {
  medicineDiaryID: number;
  medicine: string;
}
