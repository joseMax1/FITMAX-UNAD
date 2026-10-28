import type { DefaultSession } from "next-auth";

// El id del usuario viaja en el JWT y en la sesión; se tipa aquí para no usar `any`.
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
