interface CreatePetModel extends mongoose.Document {
  petName: string;
  birthDate: Date;
  petSex: string; //gender
  petProfilePicture: string | null;
  petSpecies: Array<string>; //brige
}

interface PetIDModel extends mongoose.Document {
  petID: number;
}
interface UpdatePetModel extends mongoose.Document {
  petID: number;
  updateElement: {
    petName?: string;
    birthDate?: Date;
    petSex?: string;
    weight?: number;
    petProfilePicture?: string;
    petSpecies?: Array<string>;
  };
}

export interface PetInforDTO {
  petName: string;
  birthDate: Date;
  petSex: string;
  petProfilePicture: string | null;
  petSpecies: Array<string>;
}

export interface DBPetInforDTO {
  petID: number;
  petName: string;
  birthDate: Date;
  petSex: string;
  petProfilePicture: string | null;
  petLevel: number;
  weight: number | null;
  petSpecies: Array<string>;
}

export interface UpdatePetInforDTO {
  petID: number;
  updateElement: {
    petName?: string;
    birthDate?: Date;
    petSex?: string;
    weight?: number;
    petProfilePicture?: string;
    petSpecies?: Array<string>;
  };
}
