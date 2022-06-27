interface CreatePetModel extends mongoose.Document {
  name: string;
  birthDate: Date;
  gender: string;
  photo: string | null;
  breeds: Array<string>;
}

interface PetIDModel extends mongoose.Document {
  petID: number;
}
interface UpdatePetModel extends mongoose.Document {
  name?: string;
  birthDate?: Date;
  gender?: string;
  weight?: number | null;
  photo?: string | null;
  breeds?: Array<string>;
}

export interface PetInforDTO {
  name: string;
  birthDate: Date;
  gender: string;
  photo: string | null;
  breeds: Array<string>;
}

export interface DBPetInforDTO {
  petID: number;
  name: string;
  birthDate: Date;
  gender: string;
  photo: string | null;
  level: number;
  weight: number | null;
  breeds: Array<string>;
}

export interface UpdatePetInforDTO {
  name?: string;
  birthDate?: Date;
  gender?: string;
  weight?: number | null;
  photo?: string | null;
  breeds?: Array<string>;
}

export interface DbSelectPetsIdNameDTO {
  petID: number;
  name: string;
}

export interface DbSelectPetsDTO {
  petID: number;
  name: string;
  photo: string | null;
  level: number;
}
