const crypto = require("crypto");
const {
  loginBetProAgent,
  findBetProUserIdByUsername,
  depositCash,
  withdrawCash,
  createUser,
  getUserBalance,
} = require("./betpro.service");
const { createBetProClient } = require("./betpro.client");
const { loadSessionsFromDisk, saveSessionsToDisk } = require("./session.store");

const activeBetProSessions = new Map();

/**
 * Server start hote hi disk se purane sessions restore karta hai.
 * Isi wajah se nodemon restart (ya dev server dobara start) hone par
 * bhi dobara login nahi karna parta.
 */
function restoreSessionsFromDisk() {
  const savedSessions = loadSessionsFromDisk();

  for (const [sessionId, savedSession] of Object.entries(savedSessions)) {
    try {
      const { client, jar } = createBetProClient(savedSession.jar);

      activeBetProSessions.set(sessionId, {
        client,
        jar,
        username: savedSession.username,
        createdAt: savedSession.createdAt,
      });
    } catch (err) {
      console.error(
        `Session ${sessionId} restore nahi hui, skip kar rahe hain:`,
        err.message,
      );
    }
  }

  if (activeBetProSessions.size > 0) {
    console.log(
      `${activeBetProSessions.size} BetPro session(s) disk se restore ho gaye.`,
    );
  }
}

/**
 * Poora Map disk par likh deta hai (jar serialize karke).
 * Har handler ke successful hone ke baad call hota hai taake cookie
 * changes (agar BetPro naya session cookie bheje) bhi persist ho jayein.
 */
function persistAllSessions() {
  const plainObject = {};

  for (const [sessionId, session] of activeBetProSessions.entries()) {
    try {
      plainObject[sessionId] = {
        username: session.username,
        createdAt: session.createdAt,
        jar: session.jar.serializeSync(),
      };
    } catch (err) {
      console.error(
        `Session ${sessionId} serialize nahi hui, skip kar rahe hain:`,
        err.message,
      );
    }
  }

  saveSessionsToDisk(plainObject);
}

restoreSessionsFromDisk();

function getSessionOrThrow(sessionId) {
  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("sessionId required hai.");
  }

  const session = activeBetProSessions.get(sessionId);

  if (!session) {
    throw new Error(
      "Session invalid ya expire ho gaya hai. Dobara login karein.",
    );
  }

  return session;
}

async function loginHandler(req, res) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username aur password required hain.",
      });
    }

    const { client, jar } = await loginBetProAgent({ username, password });
    const sessionId = crypto.randomUUID();

    activeBetProSessions.set(sessionId, {
      client,
      jar,
      username,
      createdAt: Date.now(),
    });

    persistAllSessions();

    return res.status(200).json({
      success: true,
      message: "BetPro login successful",
      sessionId,
      username,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
}

async function depositHandler(req, res) {
  try {
    const { sessionId, targetUsername, amount, description } = req.body || {};
    const session = getSessionOrThrow(sessionId);

    if (!targetUsername || typeof targetUsername !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "targetUsername required hai." });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount valid positive number hona chahiye.",
      });
    }

    const targetUserId = await findBetProUserIdByUsername({
      client: session.client,
      username: targetUsername,
    });
    const result = await depositCash({
      client: session.client,
      targetUserId,
      amount: numericAmount,
      description,
    });

    persistAllSessions();

    return res.status(200).json({
      success: true,
      message: result.message,
      targetUsername,
      amount: numericAmount,
      status: result.status,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message || "Deposit failed." });
  }
}

async function withdrawHandler(req, res) {
  try {
    const { sessionId, targetUsername, amount, description } = req.body || {};
    const session = getSessionOrThrow(sessionId);

    if (!targetUsername || typeof targetUsername !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "targetUsername required hai." });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount valid positive number hona chahiye.",
      });
    }

    const targetUserId = await findBetProUserIdByUsername({
      client: session.client,
      username: targetUsername,
    });
    const result = await withdrawCash({
      client: session.client,
      targetUserId,
      amount: numericAmount,
      description,
    });

    persistAllSessions();

    return res.status(200).json({
      success: true,
      message: result.message,
      targetUsername,
      amount: numericAmount,
      status: result.status,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message || "Withdrawal failed." });
  }
}

async function createUserHandler(req, res) {
  try {
    const { sessionId, username, password, phone, reference, notes } =
      req.body || {};
    const session = getSessionOrThrow(sessionId);

    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "username required hai." });
    }

    if (!password || typeof password !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "password required hai." });
    }

    const result = await createUser({
      client: session.client,
      username,
      password,
      phone,
      reference,
      notes,
    });

    persistAllSessions();

    return res.status(200).json({
      success: true,
      message: result.message,
      username,
      status: result.status,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Create user failed.",
    });
  }
}

async function checkBalanceHandler(req, res) {
  try {
    const { sessionId, username } = req.body || {};
    const session = getSessionOrThrow(sessionId);

    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "username required hai." });
    }

    const targetUserId = await findBetProUserIdByUsername({
      client: session.client,
      username,
    });
    const result = await getUserBalance({
      client: session.client,
      targetUserId,
    });

    persistAllSessions();

    return res.status(200).json({
      success: true,
      username,
      displayName: result.displayName,
      balance: result.balance,
      details: result.details,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Balance check failed.",
    });
  }
}

module.exports = {
  loginHandler,
  depositHandler,
  withdrawHandler,
  createUserHandler,
  checkBalanceHandler,
};
