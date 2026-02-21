"use client";

import type { PipelineItem } from "@/data/pipeline";
import type { DbMentorCheckin } from "@/lib/types";

const SAVED_IDS_KEY = "air-demo-saved-ids-v1";
const PIPELINE_KEY = "air-demo-pipeline-items-v1";
const PROFILE_KEY = "air-demo-profile-v1";
const CHECKINS_KEY = "air-demo-checkins-v1";

export type DemoProfile = {
  displayName: string;
  location: string;
  skills: string;
  beats: string;
  payFloor: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export function readDemoSavedIds() {
  return readJson<string[]>(SAVED_IDS_KEY, []);
}

export function writeDemoSavedIds(ids: string[]) {
  writeJson(SAVED_IDS_KEY, ids);
}

export function readDemoPipelineItems() {
  return readJson<PipelineItem[]>(PIPELINE_KEY, []);
}

export function writeDemoPipelineItems(items: PipelineItem[]) {
  writeJson(PIPELINE_KEY, items);
}

export function readDemoProfile() {
  return readJson<DemoProfile | null>(PROFILE_KEY, null);
}

export function writeDemoProfile(profile: DemoProfile) {
  writeJson(PROFILE_KEY, profile);
}

export function readDemoCheckins() {
  return readJson<DbMentorCheckin[]>(CHECKINS_KEY, []);
}

export function writeDemoCheckins(checkins: DbMentorCheckin[]) {
  writeJson(CHECKINS_KEY, checkins);
}
