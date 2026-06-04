/** DOMINIO — Usuario autenticado. */
export interface User {
  id: number;
  username: string;
  roleCode: "admin" | "normal";
}

/** Entidad interna con contraseña cifrada (solo para repositorio). */
export interface UserWithPassword extends User {
  encryptedPassword: string;
}
