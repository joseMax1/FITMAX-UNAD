import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "FITMAX",
  description: "Entrenamiento, nutrición y asistente Claude",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#101114",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }`,
          }}
        />
      </body>
    </html>
  );
}
