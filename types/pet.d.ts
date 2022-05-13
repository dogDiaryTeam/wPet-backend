interface CreatePetModel extends mongoose.Document {
  petName: string;
  birthDate: Date;
  petSex: string;
  petProfilePicture: string;
  petSpecies: Array<string>;
}

interface PetNameModel extends mongoose.Document {
  petName: string;
}
interface UpdatePetModel extends mongoose.Document {
  petName?: string;
  birthDate?: Date;
  petSex?: string;
  weight?: number;
  petProfilePicture?: string;
  petSpecies?: Array<string>;
}

export interface PetInforDTO {
  petName: string;
  birthDate: Date;
  petSex: string;
  petProfilePicture: string;
  petSpecies: Array<string>;
}

export interface DBPetInforDTO {
  petID: number;
  petName: string;
  birthDate: Date;
  petSex: string;
  petProfilePicture: string;
  petLevel: number;
  weight: number | null;
  petpecies: string;
}

export interface UpdatePetInforDTO {
  petName?: string;
  birthDate?: Date;
  petSex?: string;
  weight?: number;
  petProfilePicture?: string;
  petSpecies?: Array<string>;
}
