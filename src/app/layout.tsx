import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/app-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "YAP Mastery",
  description: "Learn Spanish with AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${sourceCodePro.variable} font-body antialiased`}>
        <AppProvider>
            {children}
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
