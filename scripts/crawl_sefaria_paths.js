/**
 * Sefaria Path Crawler (v3.4 - Dual-Register Discovery)
 * Filepath: scripts/crawl_sefaria_paths.js
 * Role: Discovers 'merged.json' files and tracks folder-level checkpoints.
 * Outputs:
 * - lib/etl/sefaria_structured_index.json (The Manuscript Catalogue)
 * - lib/etl/sefaria_full_directory.json (The Checkpoint Register)
 */

import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment Configuration ---
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

const DIRECTORY_CHECKPOINT_PATH = path.join(
  __dirname,
  "../lib/etl/sefaria_full_directory.json"
);
const STRUCTURED_INDEX_PATH = path.join(
  __dirname,
  "../lib/etl/sefaria_structured_index.json"
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
 * Utility: Safe JSON loader
 */
function loadPersistedState() {
  if (fs.existsSync(DIRECTORY_CHECKPOINT_PATH)) {
    try {
      const data = fs.readFileSync(DIRECTORY_CHECKPOINT_PATH, "utf8");
      checkpointState = JSON.parse(data);
    } catch {
      console.warn("[Init] Checkpoint file corrupt. Starting fresh.");
    }
  }

  if (fs.existsSync(STRUCTURED_INDEX_PATH)) {
    try {
      const data = fs.readFileSync(STRUCTURED_INDEX_PATH, "utf8");
      manuscriptIndex = JSON.parse(data);
    } catch {
      console.warn("[Init] Index file corrupt.");
    }
  }
}

/**
 * Utility: Unified Disk Persistence
 */
function persist() {
  const dir = path.dirname(DIRECTORY_CHECKPOINT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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

  const language = segments.pop();
  const book = segments[segments.length - 1];
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
    await wait(150); // Throttle to protect secondary rate limits
    const response = await axios.get(`${GITHUB_API}/${dirPath}`, {
      headers: HEADERS,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      const resetTime = error.response.headers["x-ratelimit-reset"];
      console.error(
        `\n🛑 RATE LIMIT EXCEEDED. Resets at: ${new Date(
          resetTime * 1000
        ).toLocaleTimeString()}`
      );
      process.exit(1);
    }
    console.error(`❌ Fetch failed for ${dirPath}:`, error.message);
    return null;
  }
}

/**
 * Recursive Discovery Loop
 */
async function crawl(currentPath) {
  // Checkpoint Skip: If this folder and all children are marked done
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
      // Logic: Only search for paths including "merged.json"
      const manuscriptMeta = parseManuscript(item.path);

      // Prevent duplicates in index
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

  // Once all items in this directory are processed, mark directory as complete
  if (!checkpointState.completed_dirs.includes(currentPath)) {
    checkpointState.completed_dirs.push(currentPath);
    persist();
    console.log(`📂 Checkpoint Reached: ${currentPath}`);
  }
}

async function run() {
  console.log("🚀 Initiating Sefaria Discovery Loop...");

  if (!GITHUB_PAT) {
    console.warn(
      "[!] No GITHUB_PAT found. Crawler will hit 60req/hr limit quickly."
    );
  }

  loadPersistedState();

  console.log(
    `[Resume]: Found ${manuscriptIndex.index.length} manuscripts. Skipping ${checkpointState.completed_dirs.length} folders.`
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
  }
}

run();
