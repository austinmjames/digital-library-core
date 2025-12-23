import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL = "austin@jenisan.com";
const PASSWORD = "Br177any";

async function createUser() {
  console.log(`Creating user: ${EMAIL}...`);

  // Check if user exists first to avoid error (optional, logic inside signUp usually handles basic checks)
  // But signUp with existing email just returns the user without error usually, or error if config differs.

  const { data, error } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: {
      data: {
        full_name: "Austin",
      },
      // Auto-confirm if you have email confirmations enabled but want to bypass for seeding
      // Note: 'email_confirm' option isn't directly available in client library usually,
      // you might need to use admin API if you have service role.
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else if (data.user && !data.session) {
    console.log(
      "User created, but email confirmation required (check Supabase settings or email inbox)."
    );
    console.log("User ID:", data.user.id);
  } else if (data.user && data.session) {
    console.log("✅ User created and logged in!");
    console.log("User ID:", data.user.id);
  }
}

createUser();
