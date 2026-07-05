const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export function loginBetPro({ username, password }) {
  return postJson("/api/betpro/login", { username, password });
}

export function depositBetPro({
  sessionId,
  targetUsername,
  amount,
  description,
}) {
  return postJson("/api/betpro/deposit", {
    sessionId,
    targetUsername,
    amount,
    description,
  });
}

export function withdrawBetPro({
  sessionId,
  targetUsername,
  amount,
  description,
}) {
  return postJson("/api/betpro/withdraw", {
    sessionId,
    targetUsername,
    amount,
    description,
  });
}

export function createUserBetPro({ sessionId, username, password }) {
  return postJson("/api/betpro/create-user", { sessionId, username, password });
}

export function checkBalanceBetPro({ sessionId, username }) {
  return postJson("/api/betpro/balance", { sessionId, username });
}
