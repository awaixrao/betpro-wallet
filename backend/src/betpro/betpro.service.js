const cheerio = require("cheerio");
const { createBetProClient } = require("./betpro.client");

const BASE_URL = "https://bpexch.live";
const LOGIN_URL = `${BASE_URL}/Users/Login`;
const ACCOUNTS_URL = `${BASE_URL}/Accounts`;
const CREATE_USER_URL = `${BASE_URL}/Users/Create`;

/**
 * Step 1 + 2: BetPro agent login karta hai.
 * - Login page open karke anti-forgery token nikalta hai.
 * - Token ke sath credentials POST karta hai.
 * - Cookie jar isi client ke sath attached rehta hai, isliye
 *   yehi client baad ki sari requests (cash page, deposit, withdraw) ke liye reuse hoga.
 *
 * NOTE: jar bhi return karte hain taake controller isko disk par persist
 * kar sake (session ko restart ke across zinda rakhne ke liye).
 */
async function loginBetProAgent({ username, password }) {
  const { client, jar } = createBetProClient();

  const loginPageResponse = await client.get(LOGIN_URL);

  if (loginPageResponse.status !== 200) {
    throw new Error(
      `BetPro login page open nahi hua. Status: ${loginPageResponse.status}`,
    );
  }

  const $ = cheerio.load(loginPageResponse.data);
  const token = $('input[name="__RequestVerificationToken"]').val();

  if (!token) {
    throw new Error("BetPro login anti-forgery token nahi mila.");
  }

  const formData = new URLSearchParams({
    "user.Username": username,
    "user.Password": password,
    Device: "Google Chrome",
    UtcOffset: "300",
    __RequestVerificationToken: token,
  });

  const loginResponse = await client.post(LOGIN_URL, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE_URL,
      Referer: LOGIN_URL,
    },
  });

  const cookies = await jar.getCookies(BASE_URL);
  const responseText = String(loginResponse.data || "").toLowerCase();

  const loginFailed =
    responseText.includes("invalid") ||
    responseText.includes("incorrect") ||
    responseText.includes("login failed") ||
    responseText.includes("wrong password") ||
    cookies.length === 0;

  if (loginFailed) {
    throw new Error("BetPro username ya password incorrect hai.");
  }

  return {
    success: true,
    message: "BetPro login successful",
    client,
    jar,
  };
}

/**
 * Accounts page se target username ka numeric internal ID nikalta hai.
 *
 * NOTE (important): Yeh approach abhi Accounts page ke pehle/current
 * listing view par depend karti hai. Agar BetPro Accounts page pagination
 * ya search-based hai, to yeh function future me update karna paray ga
 * (e.g. search query param add karna, ya multiple pages loop karna).
 */
async function findBetProUserIdByUsername({ client, username }) {
  const cleanUsername = String(username).trim().toLowerCase();

  if (!cleanUsername) {
    throw new Error("Target username required hai.");
  }

  const response = await client.get(ACCOUNTS_URL, {
    headers: {
      Referer: `${BASE_URL}/`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Accounts page open nahi hua. Status: ${response.status}`);
  }

  const $ = cheerio.load(response.data);
  let targetUserId = null;

  $("tr").each((_, row) => {
    if (targetUserId) return;

    const rowText = $(row).text().replace(/\s+/g, " ").trim().toLowerCase();
    if (!rowText.includes(cleanUsername)) return;

    const cashLink = $(row).find("a[href*='/Accounts/Cash?id=']").first();
    const href = cashLink.attr("href");
    if (!href) return;

    const match = href.match(/[?&]id=(\d+)/);
    if (match?.[1]) {
      targetUserId = match[1];
    }
  });

  if (!targetUserId) {
    throw new Error(`User "${username}" not found in BetPro Accounts page.`);
  }

  return targetUserId;
}

/**
 * Cash page open karke ek FRESH anti-forgery token leta hai.
 * Yeh token login token se ALAG hota hai, is liye deposit/withdraw
 * se pehle har bar dobara fetch karna zaroori hai.
 */
async function getCashPage({ client, targetUserId }) {
  const cashPageUrl = `${BASE_URL}/Accounts/Cash?id=${targetUserId}`;

  const response = await client.get(cashPageUrl, {
    headers: {
      Referer: ACCOUNTS_URL,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Cash page open nahi hua. Status: ${response.status}`);
  }

  const $ = cheerio.load(response.data);
  const token = $('input[name="__RequestVerificationToken"]').first().val();

  if (!token) {
    throw new Error("Cash page anti-forgery token nahi mila.");
  }

  return { cashPageUrl, token };
}

/**
 * Cash page ki top table se Credit / Balance / Max Withdraw scrape karta hai.
 *
 * HTML shape (screenshot/network se confirm hua):
 * <table>
 *   <tr><td>Credit</td><td>Balance</td><td>Max Widthdraw</td></tr>
 *   <tr><th>0 DHM</th><th>0 DHM</th><th>10 DHM</th></tr>
 * </table>
 *
 * "Balance" jo dashboard pe dikhana hai wo actual "Max Withdraw" column
 * ki value hai (jaisa aap ne bataya). Header text match karke column
 * index dhoondte hain taake agar spelling ("Widthdraw" typo) ya order
 * BetPro side se change ho, tab bhi header-text-based matching kaam karti rahe.
 */
async function getUserBalance({ client, targetUserId }) {
  const cashPageUrl = `${BASE_URL}/Accounts/Cash?id=${targetUserId}`;

  const response = await client.get(cashPageUrl, {
    headers: {
      Referer: ACCOUNTS_URL,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Cash page open nahi hua. Status: ${response.status}`);
  }

  const $ = cheerio.load(response.data);

  const displayName = $("h5 strong").first().text().trim() || null;

  const table = $("table.table").first();
  const headerRow = table.find("tr").eq(0);
  const valueRow = table.find("tr").eq(1);

  const headerCells = headerRow.find("td, th");
  const valueCells = valueRow.find("td, th");

  if (!headerCells.length || !valueCells.length) {
    throw new Error("Balance table BetPro page par nahi mili.");
  }

  const values = {};
  let maxWithdrawValue = null;

  headerCells.each((idx, el) => {
    const label = $(el).text().trim();
    const value = $(valueCells.get(idx)).text().trim();
    values[label] = value;

    if (label.toLowerCase().includes("max")) {
      maxWithdrawValue = value;
    }
  });

  if (maxWithdrawValue === null) {
    throw new Error("Max Withdraw column BetPro page par nahi mila.");
  }

  return {
    displayName,
    balance: maxWithdrawValue,
    details: values,
  };
}

/**
 * Deposit request. IMPORTANT: BetPro ke actual "Deposit" form ka field
 * name "CreditAmount" hai (yeh confirm hua actual Cash page HTML se —
 * pehle wali assumption "DebitAmount" GALAT thi, isi wajah se balance
 * reverse chal raha tha).
 */
async function depositCash({ client, targetUserId, amount, description }) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Deposit amount valid positive number hona chahiye.");
  }

  const { cashPageUrl, token } = await getCashPage({ client, targetUserId });

  const formData = new URLSearchParams({
    [String(targetUserId)]: String(targetUserId),
    IssueDescription: description || "Cash payment to user from agent",
    CreditAmount: String(numericAmount),
    DId: Buffer.from("Google Chrome").toString("base64"),
    __RequestVerificationToken: token,
  });

  const response = await client.post(cashPageUrl, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE_URL,
      Referer: cashPageUrl,
    },
  });

  if (![200, 302].includes(response.status)) {
    throw new Error(`Deposit request failed. Status: ${response.status}`);
  }

  return {
    success: true,
    message: "Deposit request submitted successfully.",
    status: response.status,
    redirectUrl: response.headers.location || null,
  };
}

/**
 * Withdraw request. IMPORTANT: BetPro ke actual "Withdraw" form ka field
 * name "DebitAmount" hai (pehle "CreditAmount" tha, jo galat tha).
 */
async function withdrawCash({ client, targetUserId, amount, description }) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Withdrawal amount valid positive number hona chahiye.");
  }

  const { cashPageUrl, token } = await getCashPage({ client, targetUserId });

  const formData = new URLSearchParams({
    [String(targetUserId)]: String(targetUserId),
    IssueDescription: description || "Cash payment to agent from user",
    DebitAmount: String(numericAmount),
    DId: Buffer.from("Google Chrome").toString("base64"),
    __RequestVerificationToken: token,
  });

  const response = await client.post(cashPageUrl, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE_URL,
      Referer: cashPageUrl,
    },
  });

  if (![200, 302].includes(response.status)) {
    throw new Error(`Withdrawal request failed. Status: ${response.status}`);
  }

  return {
    success: true,
    message: "Withdrawal request submitted successfully.",
    status: response.status,
    redirectUrl: response.headers.location || null,
  };
}

/**
 * Create-user page open karke fresh anti-forgery token leta hai.
 * Yeh token login/cash page ke tokens se ALAG hota hai.
 */
async function getCreateUserPageToken({ client }) {
  const response = await client.get(CREATE_USER_URL, {
    headers: {
      Referer: `${BASE_URL}/`,
    },
  });

  if (response.status !== 200) {
    throw new Error(
      `Create User page open nahi hua. Status: ${response.status}`,
    );
  }

  const $ = cheerio.load(response.data);
  const token = $('input[name="__RequestVerificationToken"]').first().val();

  if (!token) {
    throw new Error("Create User page anti-forgery token nahi mila.");
  }

  return token;
}

/**
 * Naya downline user create karta hai.
 *
 * Field mapping (browser network tab se capture kiya gaya, exact order
 * ke sath replicate kiya hai kyunke ASP.NET model binding is order par
 * depend karti hai -- especially checkbox field "user.IsActive" jo do
 * bar aata hai: pehle "true" (checked value) aur end me "false"
 * (unchecked hidden fallback). Yeh standard ASP.NET MVC checkbox pattern hai.
 *
 * - user.Type aur __Invariant fixed hain (user type "4" = normal downline user).
 * - Downline "0" fixed hai (root-level create, jaisa capture hua tha).
 * - user.Phone / user.Reference / user.Notes optional hain, empty ja sakte hain.
 */
async function createUser({
  client,
  username,
  password,
  phone,
  reference,
  notes,
}) {
  const cleanUsername = String(username || "").trim();
  const cleanPassword = String(password || "");

  if (!cleanUsername) {
    throw new Error("Username required hai.");
  }

  if (!cleanPassword) {
    throw new Error("Password required hai.");
  }

  const token = await getCreateUserPageToken({ client });

  const formData = new URLSearchParams();
  formData.append("user.Username", cleanUsername);
  formData.append("user.Password", cleanPassword);
  formData.append("user.Type", "4");
  formData.append("Downline", "0");
  formData.append("__Invariant", "Downline");
  formData.append("user.IsActive", "true");
  formData.append("user.Phone", phone || "");
  formData.append("user.Reference", reference || "");
  formData.append("user.Notes", notes || "");
  formData.append("__RequestVerificationToken", token);
  formData.append("user.IsActive", "false");

  const response = await client.post(CREATE_USER_URL, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE_URL,
      Referer: CREATE_USER_URL,
    },
  });

  if (![200, 302].includes(response.status)) {
    throw new Error(`Create User request failed. Status: ${response.status}`);
  }

  // 200 pe form dobara render ho sakta hai (validation error, e.g. username
  // already taken). 302 redirect hi actual success ka strongest signal hai.
  if (response.status === 200) {
    const responseText = String(response.data || "").toLowerCase();
    const looksLikeFailure =
      responseText.includes("already exist") ||
      responseText.includes("already taken") ||
      responseText.includes("field-validation-error") ||
      responseText.includes("validation-summary-errors");

    if (looksLikeFailure) {
      throw new Error(
        `User create nahi hua. BetPro ne form dobara return kiya (possible validation error for "${cleanUsername}").`,
      );
    }
  }

  return {
    success: true,
    message: "User created successfully.",
    status: response.status,
    redirectUrl: response.headers.location || null,
  };
}

module.exports = {
  loginBetProAgent,
  findBetProUserIdByUsername,
  depositCash,
  withdrawCash,
  createUser,
  getUserBalance,
};
