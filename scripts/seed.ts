import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Starting seed process (Refined)...");

  try {
    // 1. Get a user
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    if (!users.users.length) {
      throw new Error("No users found. Please sign up a user first.");
    }

    const userId = users.users[0].id;
    console.log(`👤 Using user ID: ${userId}`);

    // Check for --reset flag
    const args = process.argv.slice(2);
    if (args.includes("--reset")) {
      console.log("🗑️ Resetting data for user...");

      // Delete media items (cascades to collection_media)
      const { error: mediaDelError } = await supabase
        .from("media_items")
        .delete()
        .eq("user_id", userId);

      if (mediaDelError) {
        throw new Error(
          `Error resetting media items: ${mediaDelError.message}`,
        );
      }

      // Delete collections (cascades to collection_media)
      const { error: colDelError } = await supabase
        .from("collections")
        .delete()
        .eq("user_id", userId);

      if (colDelError) {
        throw new Error(`Error resetting collections: ${colDelError.message}`);
      }

      console.log("✅ Data reset complete.");
    }

    // Helper for generating dates within 6 months of 2026-02-16
    const REFERENCE_DATE = new Date("2026-02-16T00:00:00.000Z");
    const SIX_MONTHS_AGO = new Date(REFERENCE_DATE);
    SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

    const generateDates = () => {
      const createdAt = faker.date.between({
        from: SIX_MONTHS_AGO,
        to: REFERENCE_DATE,
      });
      const updatedAt = faker.date.between({
        from: createdAt,
        to: REFERENCE_DATE,
      });
      let completedAt: Date | null = null;

      // Random chance to be completed (if status allows, but let's just set it for some items)
      // or strictly follow status. Let's make it simple:
      if (faker.datatype.boolean(0.7)) {
        // 70% chance to have a completion date
        completedAt = faker.date.between({
          from: createdAt,
          to: REFERENCE_DATE,
        });
      }

      return { createdAt, updatedAt, completedAt };
    };

    // Helper for titles: lorem words 7-13 chars?
    // Requirement: "lorem.words for all Title... min 7 chars, max 13 chars"
    // `faker.lorem.words(n)` returns n words.
    // `faker.lorem.word({ length: { min: 7, max: 13 } })` returns ONE word.
    // "Title" usually implies multiple words.
    // If requirement means the *length of the title string* is 7-13 chars:
    // That's very short for a title (1-2 words).
    // If requirement means *each word* is 7-13 chars, that's very long words.
    // I will assume "Title length 7-13 chars" (likely 1-3 short words or 1 long word).
    // Or maybe "Title consisting of words, where total length is 7-13".
    // Let's generate a string and slice it or retry until length is correct?
    // Efficient way: `faker.lorem.words({ min: 1, max: 3 })` and checking length?
    // Let's try `faker.lorem.slug` or similar?
    // Requirement says "Use lorem.words...".
    // I will generate 1-3 words and truncate/pad to fit 7-13 range if needed, or retry.
    // Actually, `faker.lorem.words(2)` is typically ~10-15 chars.

    // RE-READING: "Sử dụng lorem.words cho tất cả Title... tối thiểu 7 ký tự, tối đa 13 ký tự."
    // Likely means the whole title string length.

    const generateTitle = () => {
      let title = "";
      let attempts = 0;
      while ((title.length < 7 || title.length > 13) && attempts < 10) {
        // Try 1-2 words
        title = faker.lorem.words(faker.number.int({ min: 1, max: 2 }));
        attempts++;
      }
      // Fallback if random gen fails to satisfy constraints
      if (title.length < 7) title = title.padEnd(7, " x");
      if (title.length > 13) title = title.substring(0, 13);
      return title;
    };

    // 2. Generate Collections
    console.log("📚 Generating 10 Collections...");
    const collectionsData = Array.from({ length: 10 }).map(() => {
      const { createdAt } = generateDates();
      return {
        user_id: userId,
        name: generateTitle(), // Simplified title
        color: faker.color.rgb(),
        created_at: createdAt.toISOString(),
      };
    });

    const { data: collections, error: collectionsError } = await supabase
      .from("collections")
      .insert(collectionsData)
      .select();

    if (collectionsError) {
      throw new Error(
        `Error inserting collections: ${collectionsError.message}`,
      );
    }

    console.log(`✅ Created ${collections.length} collections.`);

    // 3. Generate Media Items
    console.log("🎬 Generating 100 Media Items...");
    const mediaTypes = ["movie", "book", "comic", "game", "music"] as const;
    const origins = [
      "vn",
      "cn",
      "jp",
      "kr",
      "us",
      "uk",
      "eu",
      "other",
    ] as const;
    const pubStatuses = [
      "planning",
      "ongoing",
      "completed",
      "dropped",
    ] as const;
    const userStatuses = [
      "planning",
      "ongoing",
      "completed",
      "dropped",
    ] as const;

    const possibleTags = [
      "action",
      "adventure",
      "comedy",
      "drama",
      "fantasy",
      "horror",
      "mystery",
      "romance",
      "sci-fi",
      "thriller",
      "slice of life",
      "historical",
      "sports",
      "mecha",
      "music",
      "supernatural",
      "psychological",
      "school",
      "military",
    ]; // Extended list to ensure enough distinct tags for 4-13 selection

    const mediaData = Array.from({ length: 100 }).map(() => {
      const type = faker.helpers.arrayElement(mediaTypes);
      const { createdAt, updatedAt, completedAt } = generateDates();

      return {
        user_id: userId,
        title: generateTitle(), // Simplified title
        type: type,
        origin: faker.helpers.arrayElement(origins),
        pub_status: faker.helpers.arrayElement(pubStatuses),
        user_status: faker.helpers.arrayElement(userStatuses),
        release_year: faker.number.int({ min: 1990, max: 2025 }),
        rating: faker.number.float({ min: 0, max: 10, fractionDigits: 1 }),
        tags: faker.helpers.arrayElements(possibleTags, { min: 4, max: 13 }), // 4-13 tags
        notes: faker.lorem.sentence(),
        cover_image_url: faker.image.url(),
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        completed_at: completedAt ? completedAt.toISOString() : null,
      };
    });

    // BATCH INSERT
    const chunkSize = 50;
    let allMediaItems: any[] = [];

    for (let i = 0; i < mediaData.length; i += chunkSize) {
      const chunk = mediaData.slice(i, i + chunkSize);
      const { data: mediaChunk, error: mediaError } = await supabase
        .from("media_items")
        .insert(chunk)
        .select();

      if (mediaError) {
        throw new Error(
          `Error inserting media items chunk ${i}: ${mediaError.message}`,
        );
      }
      if (mediaChunk) {
        allMediaItems = [...allMediaItems, ...mediaChunk];
      }
    }

    console.log(`✅ Created ${allMediaItems.length} media items.`);

    // 4. Assign Media to Collections
    console.log("🔗 Assigning Media to Collections...");
    const collectionMediaData: {
      collection_id: string;
      media_item_id: string;
      added_at: string; // Also randomize this date?
    }[] = [];

    allMediaItems.forEach((item) => {
      // Randomly assign to 0-3 collections
      const targetCollections = faker.helpers.arrayElements(collections, {
        min: 0,
        max: 3,
      });
      targetCollections.forEach((collection) => {
        // added_at should be after collection created and after item created?
        // Or just random. Simplified: use item's UPDATED at.
        collectionMediaData.push({
          collection_id: collection.id,
          media_item_id: item.id,
          added_at: item.updated_at,
        });
      });
    });

    if (collectionMediaData.length > 0) {
      for (let i = 0; i < collectionMediaData.length; i += chunkSize) {
        const chunk = collectionMediaData.slice(i, i + chunkSize);
        const { error: linkError } = await supabase
          .from("collection_media")
          .insert(chunk);

        if (linkError) {
          throw new Error(
            `Error linking media chunk ${i}: ${linkError.message}`,
          );
        }
      }

      console.log(
        `✅ Created ${collectionMediaData.length} links between media and collections.`,
      );
    } else {
      console.log("ℹ️ No links created (random chance).");
    }

    console.log("✨ Refined seed process completed successfully!");
  } catch (error: any) {
    console.error("❌ SCRIPT FAILED:", error.message || error);
    process.exit(1);
  }
}

seed();
