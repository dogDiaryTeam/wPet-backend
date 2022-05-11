interface CreatePetModel extends mongoose.Document {
  petName: string;
  birthDate: string;
  petSex: string;
  petProfilePicture: string;
  petSpecies: Array<string>;
}

export interface PetInforDTO {
  petName: string;
  birthDate: string;
  petSex: string;
  petProfilePicture: string;
  petSpecies: Array<string>;
}

export interface UpdatePetInforDTO {
  petName?: string;
  birthDate?: string;
  petSex?: string;
  weight?: string;
  petProfilePicture?: string;
  petSpecies?: Array<string>;
}
