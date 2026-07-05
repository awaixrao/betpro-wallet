const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Disk se saved sessions load karta hai. File na ho ya corrupt ho
 * to empty object return karta hai (fresh start), crash nahi karta.
 */
function loadSessionsFromDisk() {
  ensureDataDir();

  if (!fs.existsSync(SESSIONS_FILE)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("Sessions file corrupt hai, fresh start:", err.message);
    return {};
  }
}

/**
 * Poore sessions object ko disk par likh deta hai.
 */
function saveSessionsToDisk(plainSessionsObject) {
  ensureDataDir();

  try {
    fs.writeFileSync(
      SESSIONS_FILE,
      JSON.stringify(plainSessionsObject, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Sessions file save nahi hui:", err.message);
  }
}

module.exports = { loadSessionsFromDisk, saveSessionsToDisk };
