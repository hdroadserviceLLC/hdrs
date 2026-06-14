import { CONTENT_KEY, SUPABASE_ANON_KEY, SUPABASE_URL } from "./site-config.js";

const LOCAL_CONTENT_URL = new URL("../../data/services.json", import.meta.url);

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function loadPublicContent() {
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("content_key", CONTENT_KEY)
      .single();

    if (!error && data?.content) {
      return data.content;
    }
  }

  const response = await fetch(LOCAL_CONTENT_URL);
  if (!response.ok) {
    throw new Error("Could not load services content.");
  }

  return response.json();
}

export async function saveContent(content) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("site_content")
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq("content_key", CONTENT_KEY)
    .select("content_key")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Your account is not allowed to update site content.");
  }
}
