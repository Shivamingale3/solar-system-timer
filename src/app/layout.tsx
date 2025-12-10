import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://timer.shivamingale.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Cosmic Timer | Cinematic 3D Solar System Focus Timer",
    template: "%s | Cosmic Timer",
  },
  description:
    "Experience productivity in 3D. A cinematic solar system timer featuring real-time orbital mechanics, focus modes, and immersive space visuals. Perfect for deep work.",
  keywords: [
    "solar system timer",
    "3d focus timer",
    "pomodoro space",
    "productivity app",
    "interactive solar system",
    "cosmos timer",
    "react three fiber",
    "cinematic timer",
  ],
  authors: [{ name: "Shivam Ingale", url: "https://shivamingale.com" }],
  creator: "Shivam Ingale",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Cosmic Timer | 3D Space Productivity",
    description:
      "Transform your focus time into a journey through the cosmos. Featuring realistic planets, shooting stars, and a supernova finale.",
    siteName: "Cosmic Timer",
    images: [
      {
        url: "/og-image.png", // We should probably ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "Cosmic Timer 3D Solar System View",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmic Timer | 3D Solar System Focus",
    description:
      "Focus like an astronaut. A beautiful 3D solar system timer for your deep work sessions.",
    creator: "@shivami", // Placeholder, assuming user handles this
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cosmic Timer",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A 3D solar system visualization that doubles as a productivity focus timer.",
    author: {
      "@type": "Person",
      name: "Shivam Ingale",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2454134193807389"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
