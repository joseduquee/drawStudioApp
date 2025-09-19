import OpenAI from "openai";
import { Shape, BaseGeo, Color, allowedColors } from "./schema";
import { detectHumanShape, detectColor, toBaseGeo } from "./keywords";
import { mapToTLColor, TLColor } from "./tldraw-colors";

if (typeof window !== "undefined") {
  throw new Error("ia/openai.ts must be imported only on the server");
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const extractJson = <T = any>(text: string): T | null => {
  if (!text) return null;
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1 || e <= s) return null;
  try {
    return JSON.parse(text.slice(s, e + 1)) as T;
  } catch {
    return null;
  }
}
const rnd = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const shortcutCar = (color?: Color | TLColor): Shape => {
  const tl = mapToTLColor(color ?? "blue");
  return {
    type: "geo",
    x: Math.random() * 200 + 100,
    y: Math.random() * 200 + 100,
    props: { geo: "rectangle", w: 160, h: 90, color: tl },
  };
}
const shortcutHouse = (color?: Color | TLColor): Shape => {
  const tl = mapToTLColor(color ?? "brown")
  return {
    type: "geo",
    x: Math.random() * 200 + 100,
    y: Math.random() * 200 + 100,
    props: { geo: "rectangle", w: 140, h: 120, color: tl },
  };
}

const mockFromPrompt = (prompt: string): Shape => {
  const wantedHuman = detectHumanShape(prompt);
  const wantedColor = detectColor(prompt);

  if (/\b(car|coche)\b/i.test(prompt)) return shortcutCar(wantedColor ?? "blue");
  if (/\b(house|casa)\b/i.test(prompt)) return shortcutHouse(wantedColor ?? "brown");

  const baseGeo: BaseGeo = toBaseGeo(wantedHuman) ?? "triangle";
  const tlColor: TLColor = mapToTLColor(wantedColor ?? "green");

  return {
    type: "geo",
    x: Math.random() * 200 + 100,
    y: Math.random() * 200 + 100,
    props: { geo: baseGeo, w: 100, h: 100, color: tlColor },
  };
}

const systemPrompt = `
You are a shape generator.
Return ONLY one JSON object with this schema (no prose, no markdown):
{
  "type": "geo",
  "props": {
    "geo": "rectangle|ellipse|triangle|diamond",
    "w": number,
    "h": number,
    "color": "red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|cyan|magenta|lime|teal|indigo|violet|gold|silver|beige"
  }
}
Rules:
- Understand Spanish/English terms. If the user asks for complex shapes (octagon, trapezoid, star...), choose the CLOSEST geo among rectangle/ellipse/triangle/diamond.
- Width/height must be between 80 and 160.
- No extra text. Only the JSON object.
`.trim();

export const generateShapeFromText = async(prompt: string): Promise<Shape> => {
  try {
    if (/\b(car|coche)\b/i.test(prompt)) return shortcutCar(detectColor(prompt));
    if (/\b(house|casa)\b/i.test(prompt)) return shortcutHouse(detectColor(prompt));

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a shape for: ${prompt}` },
        ],
        temperature: 0,
        max_tokens: 140,
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = extractJson<Shape>(raw);

      const allowedGeo: BaseGeo[] = ["rectangle", "ellipse", "triangle", "diamond"];
      const allowedColor: Color[] = allowedColors;

      if (
        parsed?.type === "geo" &&
        parsed.props &&
        allowedGeo.includes(parsed.props.geo) &&
        allowedColor.includes(parsed.props.color as Color) && 
        typeof parsed.props.w === "number" &&
        typeof parsed.props.h === "number"
      ) {
        const wantedHuman = detectHumanShape(prompt);
        const wantedBaseGeo = toBaseGeo(wantedHuman);
        const wantedColor = detectColor(prompt);

        const finalGeo: BaseGeo = wantedBaseGeo ?? parsed.props.geo;
        const finalColorHuman: Color = (wantedColor ?? parsed.props.color) as Color;

        const tlColor: TLColor = mapToTLColor(finalColorHuman);

        return {
          type: "geo",
          x: Math.random() * 200 + 100,
          y: Math.random() * 200 + 100,
          props: {
            geo: finalGeo,
            w: Math.max(80, Math.min(160, parsed.props.w || rnd(90, 140))),
            h: Math.max(80, Math.min(160, parsed.props.h || rnd(90, 140))),
            color: tlColor,
          },
        };
      }
    }

    return mockFromPrompt(prompt);
  } catch (e: any) {
    if (e?.status === 429 || e?.code === "insufficient_quota") {
      console.warn("[OpenAI] Sin créditos o límite. Fallback a mock.");
      return mockFromPrompt(prompt);
    }
    console.error("Error generating shape:", e);
    return mockFromPrompt(prompt);
  }
}

export const refineDrawing = async(shapes: unknown[]) => {
  try {
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a drawing refinement assistant. Given an array of shape objects, return ONLY a JSON array with refined versions, same schema; round w/h to nearest 10, min 20. No extra text.",
          },
          { role: "user", content: JSON.stringify(shapes) },
        ],
        temperature: 0,
        max_tokens: 500,
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const s = raw.indexOf("[");
      const e = raw.lastIndexOf("]");
      if (s !== -1 && e !== -1 && e > s) {
        try {
          const arr = JSON.parse(raw.slice(s, e + 1));

          if (Array.isArray(arr)) {
            return arr.map((sh: any) => {
              if (sh?.type === "geo" && sh?.props) {
                sh.props = {
                  ...sh.props,
                  w: typeof sh.props.w === "number" ? Math.max(Math.round(sh.props.w / 10) * 10, 20) : sh.props.w,
                  h: typeof sh.props.h === "number" ? Math.max(Math.round(sh.props.h / 10) * 10, 20) : sh.props.h,
                  color: mapToTLColor(sh.props.color),
                };
              }
              return sh;
            });
          }
        } catch {
          console.warn("Could not parse refined shapes JSON:", raw);
        }
      }
    }

    return (shapes as any[]).map((shape) => {
      if (shape && typeof shape === "object" && (shape as any).props) {
        const w =
          typeof (shape as any).props.w === "number"
            ? Math.max(Math.round((shape as any).props.w / 10) * 10, 20)
            : undefined;
        const h =
          typeof (shape as any).props.h === "number"
            ? Math.max(Math.round((shape as any).props.h / 10) * 10, 20)
            : undefined;
        return {
          ...shape,
          props: {
            ...(shape as any).props,
            ...(w ? { w } : {}),
            ...(h ? { h } : {}),
            color: mapToTLColor((shape as any).props.color),
          },
        };
      }
      return shape;
    });
  } catch (error) {
    console.error("Error refining drawing:", error);
    return shapes;
  }
}
