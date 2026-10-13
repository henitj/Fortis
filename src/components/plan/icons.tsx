import {
  Accessibility,
  Activity,
  Baby,
  CloudLightning,
  Droplets,
  FileText,
  Flame,
  HeartPulse,
  House,
  type LucideIcon,
  MessageSquare,
  PawPrint,
  Route,
  Snowflake,
  ThermometerSun,
  TriangleAlert,
  Waves,
  Wind,
  Zap,
  ZapOff,
} from "lucide-react";
import type { HazardId } from "@/lib/schema";
import type { TaskCategoryId } from "@/lib/data/categories";

export const HAZARD_ICONS: Record<HazardId, LucideIcon> = {
  "severe-storms": CloudLightning,
  flooding: Waves,
  wildfires: Flame,
  "extreme-heat": ThermometerSun,
  "extreme-cold": Snowflake,
  "power-outages": ZapOff,
  earthquakes: Activity,
  hurricanes: Wind,
};

export const CATEGORY_ICONS: Record<TaskCategoryId, LucideIcon> = {
  "water-food": Droplets,
  "first-aid": HeartPulse,
  communication: MessageSquare,
  documents: FileText,
  "power-lighting": Zap,
  evacuation: Route,
  "home-safety": House,
  "children-older-adults": Baby,
  "accessibility-medical": Accessibility,
  pets: PawPrint,
  "hazard-specific": TriangleAlert,
};
