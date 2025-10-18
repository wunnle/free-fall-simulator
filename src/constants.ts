export const planetGravities = {
  custom: 0,
  mercury: 3.7,
  venus: 8.87,
  earth: 9.8,
  moon: 1.62,
  mars: 3.71,
  jupiter: 24.79,
  saturn: 10.44,
  uranus: 8.87,
  neptune: 11.15,
  pluto: 0.62,
  sun: 274
} as const;

export type PlanetKey = keyof typeof planetGravities;
export type PlanetGravity = typeof planetGravities[PlanetKey];