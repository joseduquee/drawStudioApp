
export type TLColor =
  | "black" | "grey" | "light-violet" | "violet"
  | "blue" | "light-blue" | "yellow" | "orange"
  | "green" | "light-green" | "light-red" | "red" | "white";

export const allowedTLColors: TLColor[] = [
  "black","grey","light-violet","violet",
  "blue","light-blue","yellow","orange",
  "green","light-green","light-red","red","white",
];


export function mapToTLColor(color: string | undefined): TLColor {
  if (!color) return "blue";
  const c = color.toLowerCase();

  if ((allowedTLColors as string[]).includes(c)) return c as TLColor;


  switch (c) {
    case "pink":     return "light-red";
    case "magenta":  return "violet";
    case "violet":   return "violet";
    case "indigo":   return "violet";
    case "cyan":     return "light-blue";
    case "teal":     return "green";
    case "lime":     return "light-green";
    case "gold":     return "yellow";
    case "silver":   return "grey";
    case "brown":    return "orange";
    case "beige":    return "yellow";
    case "purple":   return "violet";
    case "orange":   return "orange";
    case "yellow":   return "yellow";
    case "green":    return "green";
    case "blue":     return "blue";
    case "red":      return "red";
    case "black":    return "black";
    case "white":    return "white";
    case "grey":
    case "gray":     return "grey";
    case "light-green": return "light-green";
    case "light-blue":  return "light-blue";
    case "light-red":   return "light-red";
    case "light-violet":return "light-violet";
    default:         return "blue";
  }
}
