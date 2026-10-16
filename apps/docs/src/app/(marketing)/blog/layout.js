import { Geist } from "next/font/google";

// The blog's text styles (blog-content.module.css, the `font-geist` class)
// read --font-geist-sans. It's loaded here rather than in the root layout so
// the blog gets Geist without changing the font on any other page.
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export default function BlogLayout({ children }) {
  return <div className={geistSans.variable}>{children}</div>;
}
