import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tavyn | One agent. Five steps.",
  description: "You run the SaaS. Tavyn runs the SEO.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the beforeInteractive script sets --section-scale on <html>
    // before hydration, so its style attribute intentionally differs from the server HTML.
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set the section scale synchronously, before the sections below are parsed/painted,
            so scaled pages (hero, waitlist) don't flash in at scale 1 and then snap. As the
            first body node, this inline script runs before any section paints. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.style.setProperty('--section-scale', window.innerHeight/780)}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
