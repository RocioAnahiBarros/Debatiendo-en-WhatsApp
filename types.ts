
export enum Persona {
  STUDENT = 'ESTUDIANTE UNIVERSITARIO',
  COLLEAGUE = 'COLEGA DOCENTE',
  AUTHORITY = 'AUTORIDAD ACADÉMICA',
}

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
}
