import hero from "./hero.jpg";
import whale from "./act-whale.jpg";
import safari from "./act-safari.jpg";
import surf from "./act-surf.jpg";
import dive from "./act-dive.jpg";
import hike from "./act-hike.jpg";
import tuktuk from "./act-tuktuk.jpg";
import culture from "./act-culture.jpg";
import boat from "./act-boat.jpg";
import village from "./act-village.jpg";

export const heroImage = hero;

export const activityImages: Record<string, string> = {
  whale,
  safari,
  surf,
  dive,
  hike,
  tuktuk,
  culture,
  boat,
  village,
};

export function resolveImage(key?: string | null): string {
  if (!key) return whale;
  return activityImages[key] ?? whale;
}