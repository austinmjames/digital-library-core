import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase keys in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  console.log("🔍 Inspecting Database State...\n");

  // 1. Check Table Existence & Counts
  const tables = ["library_books", "text_versions", "library_verses"];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`❌ Table '${table}' check failed: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists with ${count} rows.`);
    }
  }

  console.log("\n--- Sample Data Inspection (text_versions) ---");
  // 2. Check a sample row from text_versions to see slug format
  const { data: sample, error: sampleError } = await supabase
    .from("text_versions")
    .select("book_slug, version_title, language_code")
    .limit(5);

  if (sampleError) {
    console.log(`Error fetching sample: ${sampleError.message}`);
  } else if (sample.length === 0) {
    console.log(
      "⚠️ 'text_versions' is empty! This is why the reader is failing."
    );
  } else {
    console.table(sample);
    console.log(
      "\n💡 Verify that 'book_slug' matches your URL (e.g. 'genesis')"
    );
    console.log(
      "💡 Verify that 'version_title' matches the mapper in app/actions.ts"
    );
  }

  console.log("\n--- Sample Data Inspection (library_verses) ---");
  // 3. Check library_verses just in case data ended up there
  const { data: lvSample } = await supabase
    .from("library_verses")
    .select("book_slug, translation_id")
    .limit(5);

  if (lvSample && lvSample.length > 0) {
    console.table(lvSample);
    console.log(
      "⚠️ Data found in 'library_verses'. app/actions.ts might be querying the wrong table!"
    );
  } else {
    console.log("No data in 'library_verses'.");
  }
}

inspect();
