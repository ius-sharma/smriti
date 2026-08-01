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

interface UpdateWallParams {
  id: string;
  editKey: string;
  creatorName: string;
  title: string;
  theme: string;
  visibility: string;
  password?: string;
  tributes: Partial<Teacher>[];
}

/**
 * Creates a new student tribute wall in Supabase and generates an edit_key.
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
    const editKey = "EDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("tribute_walls")
      .insert([
        {
          creator_name: creatorName,
          title: title,
          theme: theme,
          visibility: visibility,
          password_hash: password || null,
          edit_key: editKey,
          tributes: tributes
        }
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error inserting wall:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id, editKey };
  } catch (err: any) {
    console.error("Server Action createTributeWall caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Updates an existing student tribute wall in Supabase if the edit key is valid.
 */
export async function updateTributeWall({
  id,
  editKey,
  creatorName,
  title,
  theme,
  visibility,
  password,
  tributes
}: UpdateWallParams) {
  try {
    // 1. Verify edit key first
    const { data: wall, error: fetchError } = await supabase
      .from("tribute_walls")
      .select("edit_key")
      .eq("id", id)
      .single();

    if (fetchError || !wall) {
      return { success: false, error: "Wall not found" };
    }

    if (wall.edit_key !== editKey) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    // 2. Perform the update
    const { error: updateError } = await supabase
      .from("tribute_walls")
      .update({
        creator_name: creatorName,
        title: title,
        theme: theme,
        visibility: visibility,
        password_hash: password || null,
        tributes: tributes
      })
      .eq("id", id);

    if (updateError) {
      console.error("Supabase error updating wall:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Server Action updateTributeWall caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Deletes a student tribute wall in Supabase if the edit key is valid.
 */
export async function deleteTributeWall(id: string, editKey: string) {
  try {
    // 1. Verify edit key first
    const { data: wall, error: fetchError } = await supabase
      .from("tribute_walls")
      .select("edit_key")
      .eq("id", id)
      .single();

    if (fetchError || !wall) {
      return { success: false, error: "Wall not found" };
    }

    if (wall.edit_key !== editKey) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    // 2. Perform delete
    const { error: deleteError } = await supabase
      .from("tribute_walls")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase error deleting wall:", deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Server Action deleteTributeWall caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Verifies if an edit key matches a wall's saved edit key.
 */
export async function verifyWallEditKey(id: string, editKey: string) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("edit_key")
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: "Wall not found" };
    }

    if (data.edit_key !== editKey) {
      return { success: false, error: "INCORRECT_KEY" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Verification failed" };
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
