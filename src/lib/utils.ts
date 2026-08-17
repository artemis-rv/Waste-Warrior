import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const digitsMap: Record<string, string[]> = {
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  gu: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'],
  mr: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  ta: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'],
  pa: ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'],
  ml: ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'],
};

export function localizeNumber(val: any, lang: string = 'en'): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  const digits = digitsMap[lang];
  if (!digits) return str;
  return str.replace(/[0-9]/g, (d) => digits[parseInt(d, 10)] || d);
}

