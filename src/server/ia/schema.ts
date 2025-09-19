import { TLColor } from "./tldraw-colors";

export type BaseGeo = "rectangle" | "ellipse" | "triangle" | "diamond";

export type Color =
  | "red" | "blue" | "green" | "yellow" | "orange"
  | "purple" | "pink" | "brown" | "black" | "white"
  | "gray" | "cyan" | "magenta" | "lime" | "teal"
  | "indigo" | "violet" | "gold" | "silver" | "beige";

export const allowedColors: Color[] = [
  "red","blue","green","yellow","orange",
  "purple","pink","brown","black","white",
  "gray","cyan","magenta","lime","teal",
  "indigo","violet","gold","silver","beige",
];

export type HumanShape =
  | "circle" | "oval" | "square" | "rectangle" | "triangle"
  | "diamond" | "rhombus" | "parallelogram" | "trapezoid" | "pentagon"
  | "hexagon" | "heptagon" | "octagon" | "nonagon" | "decagon"
  | "star" | "heart" | "cross" | "arrow" | "crescent";

export const humanToBaseGeo: Record<HumanShape, BaseGeo> = {
  circle: "ellipse",
  oval: "ellipse",
  square: "rectangle",
  rectangle: "rectangle",
  triangle: "triangle",
  diamond: "diamond",
  rhombus: "diamond",
  parallelogram: "diamond",
  trapezoid: "rectangle",
  pentagon: "triangle",
  hexagon: "diamond",
  heptagon: "diamond",
  octagon: "diamond",
  nonagon: "diamond",
  decagon: "diamond",
  star: "diamond",
  heart: "ellipse",
  cross: "rectangle",
  arrow: "triangle",
  crescent: "ellipse",
};

export type Shape = {
  type: "geo";
  x?: number;
  y?: number;
  props: { geo: BaseGeo; w: number; h: number; color: Color | TLColor };
};

export function toAllowedColor(c: string | undefined): Color {
  if (!c) return "blue";
  const lc = c.toLowerCase();
  const found = allowedColors.find(col => col === lc);
  return found ?? "blue";
}
