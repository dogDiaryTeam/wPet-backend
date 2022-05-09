interface CreatePetModel extends mongoose.Document {
  petProfilePicture: string;
  petName: string;
  birthDate: string;
  petSex: string;
  petSpeciesName: Array<string>;
}

export interface PetInforDTO {
  petProfilePicture: string;
  petName: string;
  birthDate: string;
  petSex: string;
  petSpeciesName: Array<string>;
}
