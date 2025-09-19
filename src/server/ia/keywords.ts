import { BaseGeo, Color, HumanShape, allowedColors, humanToBaseGeo } from "./schema";

export const shapeKeywords: Record<string, HumanShape> = {
  circle: "circle",
  oval: "oval",
  square: "square",
  rectangle: "rectangle",
  triangle: "triangle",
  diamond: "diamond",
  rhombus: "rhombus",
  parallelogram: "parallelogram",
  trapezoid: "trapezoid",
  pentagon: "pentagon",
  hexagon: "hexagon",
  heptagon: "heptagon",
  octagon: "octagon",
  nonagon: "nonagon",
  decagon: "decagon",
  star: "star",
  heart: "heart",
  cross: "cross",
  arrow: "arrow",
  crescent: "crescent",


  circulo: "circle",
  círculo: "circle",
  ovalo: "oval",
  óvalo: "oval",
  cuadrado: "square",
  rectangulo: "rectangle",
  rectángulo: "rectangle",
  triangulo: "triangle",
  triángulo: "triangle",
  rombo: "rhombus",
  paralelogramo: "parallelogram",
  trapecio: "trapezoid",
  pentagono: "pentagon",
  pentágono: "pentagon",
  hexagono: "hexagon",
  hexágono: "hexagon",
  heptagono: "heptagon",
  heptágono: "heptagon",
  octagono: "octagon",
  octágono: "octagon",
  nonagono: "nonagon",
  nonágono: "nonagon",
  decagono: "decagon",
  decágono: "decagon",
  estrella: "star",
  corazon: "heart",
  corazón: "heart",
  cruz: "cross",
  flecha: "arrow",
  creciente: "crescent",
};


export const colorKeywords: Record<string, Color> = {

  red: "red", blue: "blue", green: "green", yellow: "yellow", orange: "orange",
  purple: "purple", pink: "pink", brown: "brown", black: "black", white: "white",
  gray: "gray", grey: "gray", cyan: "cyan", magenta: "magenta", lime: "lime",
  teal: "teal", indigo: "indigo", violet: "violet", gold: "gold", silver: "silver",
  beige: "beige",

  rojo: "red",
  azul: "blue",
  verde: "green",
  amarillo: "yellow",
  naranja: "orange",
  morado: "purple",
  violeta: "violet",
  rosa: "pink",
  rosado: "pink",
  marron: "brown",
  marrón: "brown",
  negro: "black",
  blanco: "white",
  gris: "gray",
  cian: "cyan",
  lima: "lime",
  turquesa: "teal",
  índigo: "indigo",
  indigo_es: "indigo",
  dorado: "gold",
  plateado: "silver",
  beis: "beige",
  beige_es: "beige",
};

export const detectHumanShape = (prompt: string): HumanShape | undefined => {
  const p = (prompt || "").toLowerCase();
  for (const k of Object.keys(shapeKeywords)) {
    if (p.includes(k)) return shapeKeywords[k];
  }
  return undefined;
}

export const detectColor = (prompt: string): Color | undefined => {
  const p = (prompt || "").toLowerCase();
  for (const k of Object.keys(colorKeywords)) {
    if (p.includes(k)) return colorKeywords[k];
  }
  return undefined;
}

export const toBaseGeo = (h: HumanShape | undefined): BaseGeo | undefined => {
  return h ? humanToBaseGeo[h] : undefined;
}
