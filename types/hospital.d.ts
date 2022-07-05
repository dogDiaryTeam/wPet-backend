interface CreateHospitalRecordModel extends mongoose.Document {
  petID: number;
  hospitalName: string;
  visitDate: Date;
  cost: number | null;
  memo: string | null;
}

export interface CreateHospitalRecordDTO {
  petID: number;
  hospitalName: string;
  visitDate: Date;
  cost: number | null;
  memo: string | null;
}

export interface InfoHospitalRecordDataDTO {
  hospitalDiaryID: number;
  petID: number;
  hospitalName: string;
  visitDate: Date;
  cost: number | null;
  memo: string | null;
}
