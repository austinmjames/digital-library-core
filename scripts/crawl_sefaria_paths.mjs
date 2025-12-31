/**
 * Sefaria Path Crawler (v3.5 - CI/Vercel Optimized)
 * Filepath: scripts/crawl_sefaria_paths.js
 * Role: Discovers 'merged.json' files and tracks folder-level checkpoints.
 * Outputs:
 * - lib/etl/sefaria_structured_index.json (The Manuscript Catalogue)
 * - lib/etl/sefaria_full_directory.json (The Checkpoint Register)
 * Note: Designed for local discovery or CI build steps.
 * Vercel deployment requires GITHUB_PAT to be set in environment variables.
 */

import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment Configuration ---
// Load from .env.local locally; Vercel will provide these via Dashboard vars
const envLocalPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const { GITHUB_PAT } = process.env;

const REPO_OWNER = "Sefaria";
const REPO_NAME = "Sefaria-Export";
const BASE_PATH = "json";
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;
const RAW_BASE_URL =
  "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master";

const ETL_DIR = path.join(__dirname, "../lib/etl");
const DIRECTORY_CHECKPOINT_PATH = path.join(
  ETL_DIR,
  "sefaria_full_directory.json"
);
const STRUCTURED_INDEX_PATH = path.join(
  ETL_DIR,
  "sefaria_structured_index.json"
);

const HEADERS = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "DrashX-Discovery-Engine",
  ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
};

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// --- State Management ---
let checkpointState = {
  completed_dirs: [],
  last_sync: null,
};

let manuscriptIndex = {
  index: [],
  total_count: 0,
};

/**
 * Utility: Enforce Directory & Load State
 */
function initializeEnvironment() {
  if (!fs.existsSync(ETL_DIR)) {
    fs.mkdirSync(ETL_DIR, { recursive: true });
    console.log("[Init] Created ETL directory structure.");
  }

  if (fs.existsSync(DIRECTORY_CHECKPOINT_PATH)) {
    try {
      const data = fs.readFileSync(DIRECTORY_CHECKPOINT_PATH, "utf8");
      checkpointState = JSON.parse(data);
    } catch {
      console.warn("[Init] Checkpoint file corrupt. Resetting.");
    }
  }

  if (fs.existsSync(STRUCTURED_INDEX_PATH)) {
    try {
      const data = fs.readFileSync(STRUCTURED_INDEX_PATH, "utf8");
      manuscriptIndex = JSON.parse(data);
    } catch {
      console.warn("[Init] Index file corrupt. Resetting.");
    }
  }
}

/**
 * Utility: Unified Disk Persistence
 */
function persist() {
  checkpointState.last_sync = new Date().toISOString();
  manuscriptIndex.total_count = manuscriptIndex.index.length;

  fs.writeFileSync(
    DIRECTORY_CHECKPOINT_PATH,
    JSON.stringify(checkpointState, null, 2)
  );
  fs.writeFileSync(
    STRUCTURED_INDEX_PATH,
    JSON.stringify(manuscriptIndex, null, 2)
  );
}

/**
 * Metadata Parser
 * Converts: json/Tanakh/Torah/Genesis/Hebrew/merged.json
 */
function parseManuscript(fullPath) {
  const parts = fullPath.split("/");
  // Remove 'json' and 'merged.json'
  const segments = parts.slice(1, -1);

  const language = segments.pop() || "Unknown";
  const book = segments[segments.length - 1] || "Unknown";
  const categories = segments.slice(0, -1);

  return {
    book,
    language,
    categories,
    githubPath: fullPath,
    rawUrl: `${RAW_BASE_URL}/${fullPath}`,
  };
}

async function getContents(dirPath) {
  try {
    // Throttling to prevent secondary rate limits during deep traversal
    await wait(200);
    const response = await axios.get(`${GITHUB_API}/${dirPath}`, {
      headers: HEADERS,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      const resetTime = error.response.headers["x-ratelimit-reset"];
      const dateStr = resetTime
        ? new Date(resetTime * 1000).toLocaleTimeString()
        : "unknown";
      console.error(`\n🛑 RATE LIMIT EXCEEDED. Resets at: ${dateStr}`);
      // In a CI environment, we want to fail the build if we can't get data
      if (process.env.VERCEL) process.exit(1);
    }
    console.error(`❌ Fetch failed for ${dirPath}:`, error.message);
    return null;
  }
}

/**
 * Recursive Discovery Loop
 */
async function crawl(currentPath) {
  if (checkpointState.completed_dirs.includes(currentPath)) {
    return;
  }

  console.log(`🔍 Scanning Registry: ${currentPath}`);
  const items = await getContents(currentPath);

  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    if (item.type === "dir") {
      await crawl(item.path);
    } else if (item.name === "merged.json") {
      const manuscriptMeta = parseManuscript(item.path);

      const exists = manuscriptIndex.index.some(
        (m) => m.githubPath === item.path
      );
      if (!exists) {
        manuscriptIndex.index.push(manuscriptMeta);
        console.log(
          `   ✅ Indexed: ${manuscriptMeta.book} (${manuscriptMeta.language})`
        );
        persist();
      }
    }
  }

  if (!checkpointState.completed_dirs.includes(currentPath)) {
    checkpointState.completed_dirs.push(currentPath);
    persist();
    console.log(`📂 Checkpoint Reached: ${currentPath}`);
  }
}

async function run() {
  console.log("🚀 Initiating Sefaria Discovery Loop...");

  if (!GITHUB_PAT && !process.env.VERCEL) {
    console.warn(
      "[!] No GITHUB_PAT found. Local crawling will be restricted to 60req/hr."
    );
  }

  initializeEnvironment();

  console.log(
    `[Resume]: Found ${manuscriptIndex.index.length} entries. Skipping ${checkpointState.completed_dirs.length} folders.`
  );
  console.log("--------------------------------------------------");

  try {
    await crawl(BASE_PATH);
    console.log("--------------------------------------------------");
    console.log(
      `🎉 Discovery Finished. Total manuscripts indexed: ${manuscriptIndex.total_count}`
    );
  } catch (err) {
    console.error("❌ Crawler interrupted:", err.message);
    persist();
    if (process.env.VERCEL) process.exit(1);
  }
}

run();
