export const POSITION_GROUPS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "DB",
  "SPC",
] as const;

export type PositionGroup = (typeof POSITION_GROUPS)[number];
