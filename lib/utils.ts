import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function parseStringToArray(str: string) {
  str = str.trim().slice(1, -1);
  let items = str.split(/,\s*\n/);
  items = items.map((item) => item.trim().replace(/^"|"$/g, ""));

  return items;
}

export const jobDescription = `Basic understanding of JavaScript, React.js, and Next.js is required,
 with familiarity in CSS frameworks like Tailwind CSS or Bootstrap and state management 
 tools such as Redux or Zustand being a plus. Candidates should have an analytical mindset, problem-solving skills,
  and a strong interest in frontend development. Knowledge of debugging, testing, optimizing frontend code, and integrating APIs
   is essential. Exposure to server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR) is beneficial.
    Collaboration with designers, backend developers,
 and participation in code reviews, technical discussions, and brainstorming sessions is expected.`;



 
 export function convertToAscii(inputString: string) {
   // remove non ascii characters
   const asciiString = inputString.replace(/[^\x20-\x7F]+/g, "");
 
   return asciiString;
 }
 
 export function formatTimestampToDateHHMM(timestamp: string): string {
   const date = new Date(timestamp);
 
   // Format date to YYYY-MM-DD
   const datePart =
     date.getDate().toString().padStart(2, "0") +
     "-" +
     (date.getMonth() + 1).toString().padStart(2, "0") +
     "-" +
     date.getFullYear();
 
   // Format time to HH:MM
   const hours = date.getHours().toString().padStart(2, "0");
   const minutes = date.getMinutes().toString().padStart(2, "0");
   const timePart = `${hours}:${minutes}`;
 
   return `${datePart} ${timePart}`;
 }
 
 export function testEmail(email: string) {
   const re = /\S+@\S+\.\S+/;
 
   return re.test(email);
 }
 
 export function convertSecondstoMMSS(seconds: number) {
   const minutes = Math.trunc(seconds / 60);
   const remainingSeconds = Math.round(seconds % 60);
 
   return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
 }
 
 export function isLightColor(color: string) {
   const hex = color?.replace("#", "");
   const r = parseInt(hex?.substring(0, 2), 16);
   const g = parseInt(hex?.substring(2, 4), 16);
   const b = parseInt(hex?.substring(4, 6), 16);
   const brightness = (r * 299 + g * 587 + b * 114) / 1000;
 
   return brightness > 155;
 }
 