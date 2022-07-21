interface CreateMedicineModel extends mongoose.Document {
  petID: number;
  medicine: string;
  memo: string | null;
  cycleDay: number | null;
}

export interface CreateMedicineDTO {
  petID: number;
  medicine: string;
  memo: string | null;
  cycleDay: number | null;
}

export interface InfoMedicineDataDTO {
  medicineDiaryID: number;
  petID: number;
  cycleDay: number | null;
  medicine: string;
  memo: string | null;
}

export interface InfoMedicineIDNameDTO {
  medicineDiaryID: number;
  medicine: string;
}
