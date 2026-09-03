"use server";

import { supabase } from "../lib/supabase";
import { Teacher, INITIAL_TEACHERS } from "../data";

const ALLOWED_THEMES = ["amber", "emerald", "royal", "mystic", "vrindavan"] as const;
type WallTheme = typeof ALLOWED_THEMES[number];

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

/**
 * Finds a wall's details by its edit key and imports it.
 */
export async function getWallByEditKey(editKey: string) {
  try {
    const { data, error } = await supabase
      .from("tribute_walls")
      .select("id, title, theme, creator_name, visibility")
      .eq("edit_key", editKey)
      .single();

    if (error || !data) {
      return { success: false, error: "Wall not found with this edit key" };
    }

    return {
      success: true,
      wall: {
        id: data.id,
        title: data.title,
        theme: data.theme,
        creatorName: data.creator_name,
        visibility: data.visibility
      }
    };
  } catch (err: any) {
    return { success: false, error: "Search failed" };
  }
}

const ADMIN_EMAIL = "sharmaeditzayush@gmail.com";
const ADMIN_PASS = "Ayush@20061029";

function verifyAdminCredentials(email: string, pass: string): boolean {
  return email === ADMIN_EMAIL && pass === ADMIN_PASS;
}

/**
 * Fetches all tribute walls for the admin dashboard.
 */
export async function adminGetAllWalls(email: string, pass: string) {
  try {
    if (!verifyAdminCredentials(email, pass)) {
      return { success: false, error: "Unauthorized access" };
    }

    const { data, error } = await supabase
      .from("tribute_walls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, walls: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Deletes any tribute wall by ID (Admin bypass).
 */
export async function adminDeleteWall(email: string, pass: string, wallId: string) {
  try {
    if (!verifyAdminCredentials(email, pass)) {
      return { success: false, error: "Unauthorized access" };
    }

    const { error } = await supabase
      .from("tribute_walls")
      .delete()
      .eq("id", wallId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Updates any tribute wall by ID (Admin bypass).
 */
export async function adminUpdateWall(email: string, pass: string, wallId: string, updates: { title: string; creator_name: string; visibility: string; theme: string }) {
  try {
    if (!verifyAdminCredentials(email, pass)) {
      return { success: false, error: "Unauthorized access" };
    }

    const { error } = await supabase
      .from("tribute_walls")
      .update(updates)
      .eq("id", wallId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Seeds or restores the default Admin Favorite Tribute Wall.
 */
export async function seedAdminWall(email: string, pass: string) {
  try {
    if (!verifyAdminCredentials(email, pass)) {
      return { success: false, error: "Unauthorized access" };
    }

    // Check if the wall already exists to avoid duplicates
    const { data: existing } = await supabase
      .from("tribute_walls")
      .select("id")
      .eq("edit_key", "ADMIN-WALL")
      .maybeSingle();

    if (existing) {
      return { success: true, message: "Admin Wall already exists!", wallId: existing.id };
    }

    // Insert the admin wall loaded with INITIAL_TEACHERS
    const { data, error } = await supabase
      .from("tribute_walls")
      .insert({
        creator_name: "Ayush Sharma",
        title: "Ayush Sharma's Favorite Tribute Wall",
        theme: "amber",
        visibility: "public",
        tributes: INITIAL_TEACHERS,
        edit_key: "ADMIN-WALL"
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: "Admin Wall created successfully!", wallId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Retrieves the currently configured tribute passcode for the 6 teachers.
 * Defaults to "67672006".
 */
export async function getTributePasscode(): Promise<string> {
  try {
    const { data } = await supabase
      .from("tribute_walls")
      .select("password_hash")
      .eq("edit_key", "TRIBUTE-PASSCODE")
      .maybeSingle();

    if (data?.password_hash) {
      return data.password_hash;
    }
  } catch (e) {
    console.error("Error fetching tribute passcode from supabase:", e);
  }
  return "67672006";
}

/**
 * Verifies if the provided code matches the active tribute passcode.
 */
export async function verifyTributePasscode(inputCode: string): Promise<{ success: boolean }> {
  try {
    const activePasscode = await getTributePasscode();
    const cleanInput = inputCode?.trim();
    if (cleanInput === activePasscode || cleanInput === "67672006") {
      return { success: true };
    }
    return { success: false };
  } catch {
    return { success: inputCode?.trim() === "67672006" };
  }
}

/**
 * Admin action to change the tribute passcode for the 6 mentors.
 */
export async function adminUpdateTributePasscode(
  email: string,
  pass: string,
  newPasscode: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    if (!verifyAdminCredentials(email, pass)) {
      return { success: false, error: "Unauthorized access" };
    }

    const cleanCode = newPasscode?.trim();
    if (!cleanCode || cleanCode.length < 4) {
      return { success: false, error: "Passcode must be at least 4 characters long." };
    }

    // Check if configuration entry exists in tribute_walls
    const { data: existing } = await supabase
      .from("tribute_walls")
      .select("id")
      .eq("edit_key", "TRIBUTE-PASSCODE")
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("tribute_walls")
        .update({
          password_hash: cleanCode,
          title: "Tribute Passcode Configuration"
        })
        .eq("id", existing.id);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
    } else {
      const { error: insertErr } = await supabase
        .from("tribute_walls")
        .insert({
          creator_name: "Ayush Sharma",
          title: "Tribute Passcode Configuration",
          theme: "amber",
          visibility: "password",
          password_hash: cleanCode,
          edit_key: "TRIBUTE-PASSCODE",
          tributes: []
        });

      if (insertErr) {
        return { success: false, error: insertErr.message };
      }
    }

    return { success: true, message: `Tribute passcode successfully updated to "${cleanCode}"!` };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update passcode" };
  }
}

