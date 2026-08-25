import { Hanken_Grotesk } from 'next/font/google';
import localFont from 'next/font/local';

export const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
});

export const roundedElegance = localFont({
  src: '../public/fonts/Rounded-Elegance-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-rounded-elegance',
  display: 'swap',
});
