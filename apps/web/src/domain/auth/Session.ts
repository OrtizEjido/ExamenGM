/** DOMINIO — Sesión activa del usuario. */
export interface Session {
  token: string;
  user: {
    id: number;
    username: string;
    role: "admin" | "normal";
  };
}
