export interface SpaceEntry {
  id: string;
  name: string;
  entity: string;
  character: string;
  widthPercent: number;
}

export const SPACES: SpaceEntry[] = [
  { id: "em-quad", name: "Em Quad", entity: "&#x2001;", character: "\u2001", widthPercent: 100 },
  { id: "em-space", name: "Em Space", entity: "&#x2003;", character: "\u2003", widthPercent: 100 },
  { id: "ideo-space", name: "Ideographic Space", entity: "&#x3000;", character: "\u3000", widthPercent: 100 },
  { id: "en-quad", name: "En Quad", entity: "&#x2000;", character: "\u2000", widthPercent: 50 },
  { id: "en-space", name: "En Space", entity: "&#x2002;", character: "\u2002", widthPercent: 50 },
  { id: "figure-space", name: "Figure Space", entity: "&#x2007;", character: "\u2007", widthPercent: 50 },
  { id: "three-per-em", name: "Three-per-em", entity: "&#x2004;", character: "\u2004", widthPercent: 33.3 },
  { id: "nbsp", name: "No-break Space", entity: "&#x00A0;", character: "\u00A0", widthPercent: 25 },
  { id: "four-per-em", name: "Four-per-em", entity: "&#x2005;", character: "\u2005", widthPercent: 25 },
  { id: "punct-space", name: "Punctuation Space", entity: "&#x2008;", character: "\u2008", widthPercent: 25 },
  { id: "math-space", name: "Math Space", entity: "&#x205F;", character: "\u205F", widthPercent: 22.2 },
  { id: "thin-space", name: "Thin Space", entity: "&#x2009;", character: "\u2009", widthPercent: 20 },
  { id: "six-per-em", name: "Six-per-em", entity: "&#x2006;", character: "\u2006", widthPercent: 16.7 },
  { id: "narrow-nbsp", name: "Narrow No-break", entity: "&#x202F;", character: "\u202F", widthPercent: 12.5 },
  { id: "hair-space", name: "Hair Space", entity: "&#x200A;", character: "\u200A", widthPercent: 6.25 }
];
