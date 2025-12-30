/**
 * Sefaria Path Crawler for DrashX
 * Role: Discovers all merged.json files in the Sefaria-Export repository
 * and generates a structured index with parent/subfolder metadata.
 *
 * INCREMENTAL PERSISTENCE: This version writes to disk every time a file
 * is found or a directory is completed, ensuring data safety and accurate resume.
 */

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_OWNER = "Sefaria";
const REPO_NAME = "Sefaria-Export";
const BASE_PATH = "json";
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

const OUTPUT_PATH = path.join(
  __dirname,
  "../src/lib/etl/sefaria_full_directory.json"
);
const STRUCTURED_OUTPUT_PATH = path.join(
  __dirname,
  "../src/lib/etl/sefaria_structured_index.json"
);

// Using provided Personal Access Token for high-rate limit traversal
const HEADERS = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "DrashX-Architect",
  Authorization:
    "token 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",
};

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

let crawlState = {
  timestamp: new Date().toISOString(),
  total_files: 0,
  paths: [],
  completed_dirs: [],
};

/**
 * Parses a relative Sefaria path into structured metadata
 * e.g., "Tanakh/Torah/Genesis/English/merged.json" ->
 * { path, parent, subfolder, book, language }
 */
function parsePathStructure(relPath) {
  const parts = relPath.split("/");
  // Standard Sefaria depth: Category/SubCat/Book/Lang/merged.json

  parts.pop(); // Remove 'merged.json'
  const language = parts.pop(); // Pop 'English' or 'Hebrew'
  const book = parts[parts.length - 1];
  const subfolder = parts.slice(0, -1).join("/");
  const parent =
    parts.length > 2 ? parts.slice(0, parts.length - 2).join("/") : parts[0];

  return {
    path: relPath,
    parent,
    subfolder,
    book,
    language,
  };
}

/**
 * Load existing data from disk to resume
 */
function loadState() {
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = fs.readFileSync(OUTPUT_PATH, "utf8");
      const parsed = JSON.parse(existing);
      crawlState = {
        ...crawlState,
        ...parsed,
        paths: parsed.paths || [],
        completed_dirs: parsed.completed_dirs || [],
      };
      console.log(
        `[RESUME]: Loaded ${crawlState.paths.length} entries and ${crawlState.completed_dirs.length} completed directories.`
      );
    } catch {
      console.log("[INIT]: Starting fresh crawl.");
    }
  }
}

/**
 * Unified persistence function
 * Writes both the raw crawl state and the structured index to disk
 */
function persistState() {
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  crawlState.timestamp = new Date().toISOString();
  crawlState.total_files = crawlState.paths.length;

  // 1. Save raw crawl state (primary resume source)
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(crawlState, null, 2));

  // 2. Generate and save structured index (for application use)
  const structuredIndex = crawlState.paths.map((p) => parsePathStructure(p));

  fs.writeFileSync(
    STRUCTURED_OUTPUT_PATH,
    JSON.stringify(
      {
        timestamp: crawlState.timestamp,
        total_files: crawlState.total_files,
        index: structuredIndex,
      },
      null,
      2
    )
  );
}

async function getDirectoryContents(dirPath) {
  try {
    await wait(40); // Respect secondary rate limits
    const response = await axios.get(`${GITHUB_API}/${dirPath}`, {
      headers: HEADERS,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      const resetTime = error.response.headers["x-ratelimit-reset"];
      const date = new Date(resetTime * 1000).toLocaleTimeString();
      console.error(`\n!!! RATE LIMIT EXCEEDED !!! Resets at: ${date}`);
    } else {
      console.error(`Error fetching ${dirPath}:`, error.message);
    }
    return null;
  }
}

async function crawl(currentPath) {
  // Check if directory is already completed
  if (crawlState.completed_dirs.includes(currentPath)) {
    console.log(`[SKIPPING]: Already crawled ${currentPath}`);
    return;
  }

  console.log(`Crawling: ${currentPath}`);
  const items = await getDirectoryContents(currentPath);

  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    if (item.type === "dir") {
      await crawl(item.path);
    } else if (item.name === "merged.json") {
      const relativePath = item.path.replace("json/", "");

      if (!crawlState.paths.includes(relativePath)) {
        crawlState.paths.push(relativePath);
        console.log(`   [FOUND & SAVED]: ${relativePath}`);
        persistState(); // Save every time a new file is added to the paths array
      }
    }
  }

  // Mark directory as completed once all children are processed
  if (!crawlState.completed_dirs.includes(currentPath)) {
    crawlState.completed_dirs.push(currentPath);
    console.log(`[COMPLETED]: ${currentPath}`);
    persistState(); // Save every time a directory is finished
  }
}

async function run() {
  console.log("Starting Incremental Sefaria Discovery...");
  loadState();
  console.log("--------------------------------------------------");

  await crawl(BASE_PATH);

  console.log(`--------------------------------------------------`);
  console.log(
    `Task Complete! Structured index saved to ${STRUCTURED_OUTPUT_PATH}`
  );
}

run();
