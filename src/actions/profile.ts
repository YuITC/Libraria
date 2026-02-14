"use server";

import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET!;

// =============================================================================
// Profile Actions
// =============================================================================

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(formData: {
  display_name?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: formData.display_name,
      avatar_url: formData.avatar_url,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)", "layout");
  return { success: true };
}

// =============================================================================
// Preferences Actions
// =============================================================================

export async function updatePreferences(preferences: {
  theme?: "light" | "dark";
  language?: "en" | "vi";
  default_view?: "grid" | "list";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Fetch current preferences and merge
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
  const mergedPrefs = { ...currentPrefs, ...preferences };

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: mergedPrefs })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)", "layout");
  return { success: true };
}

export async function updateAIModel(model: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ ai_selected_model: model })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/(protected)", "layout");
  return { success: true };
}

// =============================================================================
// API Key Actions (BYOK with AES-256-GCM)
// =============================================================================

export async function saveAPIKeys(keys: {
  gemini_key?: string;
  tavily_key?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get existing encrypted credentials
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credentials_encrypted")
    .eq("id", user.id)
    .single();

  let existingKeys: Record<string, string> = {};

  if (profile?.ai_credentials_encrypted) {
    try {
      const decrypted = await decrypt(
        profile.ai_credentials_encrypted,
        ENCRYPTION_SECRET,
      );
      existingKeys = JSON.parse(decrypted);
    } catch {
      // If decryption fails, start fresh
      existingKeys = {};
    }
  }

  // Merge new keys with existing
  const mergedKeys = { ...existingKeys };
  if (keys.gemini_key !== undefined) {
    mergedKeys.gemini_key = keys.gemini_key;
  }
  if (keys.tavily_key !== undefined) {
    mergedKeys.tavily_key = keys.tavily_key;
  }

  // Encrypt and save
  const encrypted = await encrypt(
    JSON.stringify(mergedKeys),
    ENCRYPTION_SECRET,
  );

  const { error } = await supabase
    .from("profiles")
    .update({ ai_credentials_encrypted: encrypted })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function getDecryptedAPIKeys() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credentials_encrypted")
    .eq("id", user.id)
    .single();

  if (!profile?.ai_credentials_encrypted) {
    return { gemini_key: "", tavily_key: "" };
  }

  try {
    const decrypted = await decrypt(
      profile.ai_credentials_encrypted,
      ENCRYPTION_SECRET,
    );
    const keys = JSON.parse(decrypted);
    // Mask keys for display (show first 8 and last 4 chars)
    return {
      gemini_key: keys.gemini_key ? maskKey(keys.gemini_key) : "",
      tavily_key: keys.tavily_key ? maskKey(keys.tavily_key) : "",
      has_gemini: !!keys.gemini_key,
      has_tavily: !!keys.tavily_key,
    };
  } catch {
    return {
      gemini_key: "",
      tavily_key: "",
      has_gemini: false,
      has_tavily: false,
    };
  }
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••";
  return key.slice(0, 8) + "••••" + key.slice(-4);
}

// =============================================================================
// Account Actions
// =============================================================================

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Delete profile (cascades to media, collections, conversations, messages)
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  // Sign out
  await supabase.auth.signOut();

  return { success: true };
}
