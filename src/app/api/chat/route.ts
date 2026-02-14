import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  streamText,
  UIMessage,
  createUIMessageStreamResponse,
  stepCountIs,
  convertToModelMessages,
} from "ai";
import {
  librarianTools,
  analystTools,
  webSurferTools,
  collectionManagerTools,
} from "@/lib/ai/tools";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get Gemini API key from user's encrypted credentials
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_credentials_encrypted, preferred_ai_model")
    .eq("id", user.id)
    .single();

  let geminiKey: string | undefined;
  const modelId = profile?.preferred_ai_model || "gemini-2.5-flash";

  if (profile?.ai_credentials_encrypted) {
    try {
      const { decrypt } = await import("@/lib/encryption");
      const decrypted = await decrypt(
        profile.ai_credentials_encrypted,
        process.env.ENCRYPTION_SECRET!,
      );
      const keys = JSON.parse(decrypted);
      geminiKey = keys.gemini_key;
    } catch {
      // Fall through to error
    }
  }

  if (!geminiKey) {
    return new Response(
      JSON.stringify({
        error: "No Gemini API key configured. Please add it in Settings.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const allTools = {
    ...librarianTools,
    ...analystTools,
    ...webSurferTools,
    ...collectionManagerTools,
  };

  const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });

  const result = streamText({
    model: googleProvider(modelId),
    system: `You are Libraria AI, an intelligent assistant for managing a personal media library.

You have access to the following specialized tools:

**Media Management (Librarian)**:
- search_media: Search and filter media items
- create_media: Add new media items
- update_media: Update existing items
- delete_media: Delete items

**Analytics (Analyst)**:
- analyze_data: Query analytics and generate insights

**Web Search (Web Surfer)**:
- search_web: Search the internet for information

**Collections (Collection Manager)**:
- search_collections: List and search collections
- create_collection: Create new collections
- add_media_to_collection: Add items to collections
- remove_media_from_collection: Remove items from collections
- delete_collection: Delete collections

**Guidelines**:
- Use tools proactively when the user's request requires data operations
- For complex multi-step requests, explain your plan before executing
- Always confirm destructive actions (delete) before proceeding
- Format responses clearly with markdown
- When showing media items, present them in a readable list format
- If a tool returns an error, explain it to the user
- Be concise but informative
- When the user asks about their library, USE the search_media tool
- When adding items, confirm what was added
- For web searches, summarize the results clearly`,
    messages: await convertToModelMessages(messages),
    tools: allTools,
    stopWhen: stepCountIs(10),
  });

  return createUIMessageStreamResponse({
    status: 200,
    stream: result.toUIMessageStream(),
  });
}
