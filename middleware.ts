export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/entrenar/:path*", "/nutricion/:path*", "/progreso/:path*", "/bienestar/:path*", "/perfil/:path*", "/ia/:path*"],
};
