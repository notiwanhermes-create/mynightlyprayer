import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import Footer from "./components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nightly Prayer — Sleep with Peace Tonight",
  description:
    "Receive a personal nightly prayer in your inbox at the bedtime you choose. First 7 nights free, then $5.99/month. Cancel anytime.",
  icons: {
    icon:      [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut:  "/icon.svg",
    apple:     "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
