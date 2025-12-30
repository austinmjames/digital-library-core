/**
 * DrashX Admin Auth Setup
 * Role: Ensures the primary admin user exists in Supabase Auth and sets the password.
 * Usage: node scripts/setup_admin_auth.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role, not Anon

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is required in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ADMIN_UID = "08d1e076-ae97-4dcf-bd70-8f3a85e9bd34";
const ADMIN_EMAIL = "admin@drashx.com";
const ADMIN_PASSWORD = "Paintball64!";

async function setupAdmin() {
  console.log("Starting DrashX Admin Setup...");

  // 1. Check if user exists in Auth
  const {
    data: { user },
    error: fetchError,
  } = await supabase.auth.admin.getUserById(ADMIN_UID);

  if (fetchError || !user) {
    console.log("Admin user not found in Auth. Creating new user...");

    // Removed unused 'newUser' variable assignment to fix linting error
    const { error: createError } = await supabase.auth.admin.createUser({
      id: ADMIN_UID,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "DrashX Architect" },
    });

    if (createError) {
      console.error("Failed to create admin user:", createError.message);
      return;
    }
    console.log("Successfully created admin user.");
  } else {
    console.log("Admin user exists. Updating password...");

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      ADMIN_UID,
      {
        password: ADMIN_PASSWORD,
      }
    );

    if (updateError) {
      console.error("Failed to update password:", updateError.message);
      return;
    }
    console.log("Successfully updated admin password.");
  }

  console.log("--------------------------------------------------");
  console.log("Setup Complete.");
  console.log(`Login: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("--------------------------------------------------");
}

setupAdmin();
