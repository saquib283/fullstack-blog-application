import { Navbar } from "@/app-components/Navbar";
import "./globals.css";
import {Kalam,Roboto,Poppins,Quicksand,Orbitron,Fredoka,Caveat,Dancing_Script} from "next/font/google";
import {Toaster} from "react-hot-toast";
import { Footer } from "@/app-components/Footer";




export const metadata = {
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
};


console.log(""+metadata);


const kalam = Kalam({
  subsets: ['devanagari', 'latin', 'latin-ext'],
  weight: ["300","700","400"],
  variable:"--font-kalam"
})
const ds = Dancing_Script({
  subsets: ['latin','vietnamese'],
  weight: ["700", "400"],
  variable: "--font-ds"
})

const caveat = Caveat({
  subsets: ['cyrillic', 'latin'],
  weight: ["400",'500',"600", "700", "400"],
  variable: "--font-caveat"
})

const rotobo = Roboto({
  subsets:["cyrillic","cyrillic-ext","greek","math","symbols"],
  weight:['100',"200","300","400","500","600","700","800","900"],
  variable:"--font-roboto"
})

const poppins = Poppins({
  subsets:["latin","latin-ext"],
  weight:["100","200","300","400","500","600","700","800","900"],
  variable:"--font-poppins"
})

const orbitron = Orbitron({
  subsets:['latin'],
  weight:["400","500","600","700","800","900"],
  variable:"--font-orbitron"
})

const fredorka = Fredoka({
  subsets: ['latin'],
  weight: ["300","400", "500", "600", "700"],
  variable: "--font-fredorka"
})
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kalam.variable} ${rotobo.variable} ${orbitron.variable} ${fredorka.variable} ${caveat.variable} ${ds.variable}`}>
      <body>
        <Navbar/>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <Footer/>
      </body>
    </html>
  )
}


