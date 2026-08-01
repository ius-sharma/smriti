"use server";

import { supabase } from "../lib/supabase";
import { Teacher } from "../data";

interface CreateWallParams {
  creatorName: string;
  title: string;
  theme: string;
  visibility: string;
  password?: string;
  tributes: Partial<Teacher>[];
}

/**
 * Creates a new student tribute wall in Supabase.
 */
export async function createTributeWall({
  creatorName,
  title,
  theme,
  visibility,
  password,
  tributes
}: CreateWallParams) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .insert([
        {
          creator_name: creatorName,
          title: title,
          theme: theme,
          visibility: visibility,
          password_hash: password || null,
          tributes: tributes
        }
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error inserting wall:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("Server Action createTributeWall caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Fetches the metadata of a tribute wall by ID.
 */
export async function getTributeWallMetadata(id: string) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("id, creator_name, title, theme, visibility")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error fetching wall metadata:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      wall: {
        id: data.id,
        creatorName: data.creator_name,
        title: data.title,
        theme: data.theme,
        visibility: data.visibility,
        isLocked: data.visibility === "password"
      }
    };
  } catch (err: any) {
    console.error("Server Action getTributeWallMetadata caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Unlocks a password-protected tribute wall and returns the tributes.
 */
export async function unlockTributeWall(id: string, password?: string) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("tributes, password_hash, visibility")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error unlocking wall:", error);
      return { success: false, error: error.message };
    }

    if (data.visibility === "password" && data.password_hash !== password) {
      return { success: false, error: "INCORRECT_PASSWORD" };
    }

    return { success: true, tributes: data.tributes as Teacher[] };
  } catch (err: any) {
    console.error("Server Action unlockTributeWall caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Fetches the tributes directly if the wall is public.
 */
export async function getPublicTributeWallTributes(id: string) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("tributes, visibility")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error fetching public wall:", error);
      return { success: false, error: error.message };
    }

    if (data.visibility === "password") {
      return { success: false, error: "WALL_IS_LOCKED" };
    }

    return { success: true, tributes: data.tributes as Teacher[] };
  } catch (err: any) {
    console.error("Server Action getPublicTributeWallTributes caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Fetches all public walls for the gallery.
 */
export async function getPublicTributeWalls() {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("id, creator_name, title, theme, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching public list:", error);
      return { success: false, error: error.message };
    }

    return { success: true, walls: data };
  } catch (err: any) {
    console.error("Server Action getPublicTributeWalls caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}
