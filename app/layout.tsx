import type { Metadata } from "next";
import { Schibsted_Grotesk , Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "../components/LightRays";
import NavBar from "@/components/NavBar";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const  martianMono =  Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "devEvent",
  description: "hub for every dev Event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} antialiased`}
      >

        <NavBar/>

          <div className="absolute inset-0 top-0 z-[-1] min-h-screen">

              <LightRays
                  raysOrigin="top-center-offset"
                  raysColor="#5dfeca"
                  raysSpeed={0.5}
                  lightSpread={1}
                  rayLength={2}
                  followMouse={true}
                  mouseInfluence={0.2}
                  noiseAmount={0}
                  distortion={0.01}
                  className="custom-rays"
                  pulsating={false}
                  fadeDistance={2}
                  saturation={.5}
              />
          </div>

        {children}
      </body>
    </html>
  );
}
