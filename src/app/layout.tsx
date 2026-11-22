import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { EfiqoProvider } from "@/context/EfiqoContext";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bricolage",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "efIQo — Active Recall Flashcards, Quizzes & Study Workspace",
  description:
    "Create, share and study with AI-powered flashcards, timed quizzes, and side-by-side PDF reading.",
  icons: {
    icon: "/images/efIQo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "efIQo — Active Recall Flashcards, Quizzes & Study Workspace",
    description:
      "Create, share and study with AI-powered flashcards, timed quizzes, and side-by-side PDF reading.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-[#F7F8FA] text-[#0F172A] dark:bg-[#0B0F19] dark:text-[#F1F5F9] selection:bg-blue-600/20 selection:text-blue-700 dark:selection:text-blue-300 transition-colors duration-200">
        <EfiqoProvider>{children}</EfiqoProvider>
      </body>
    </html>
  );
}
