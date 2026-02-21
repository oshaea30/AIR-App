import type { Database } from "@/lib/database.types";

export type DbOpportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type DbPipelineItem = Database["public"]["Tables"]["pipeline_items"]["Row"];
export type DbMemberProfile = Database["public"]["Tables"]["member_profiles"]["Row"];
export type DbSavedOpportunity = Database["public"]["Tables"]["saved_opportunities"]["Row"];
export type DbMentorCheckin = Database["public"]["Tables"]["mentor_checkins"]["Row"];
