import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './tools.css';
import './workshop.css';
const latin=localFont({src:'../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',variable:'--tool-latin',display:'swap'});
const arabic=localFont({src:[{path:'../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2',weight:'400'},{path:'../../../node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2',weight:'700'}],variable:'--tool-arabic',display:'swap'});
export const metadata:Metadata={title:'Cut Studio — Design & Laser Toolkit',description:'Free workshop tools in the browser: image to vector, AI upscaling, poster tiling, Arabic lettering, contours, print sheets, nesting and laser preparation.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className={`${latin.variable} ${arabic.variable}`}><body>{children}</body></html>;}
