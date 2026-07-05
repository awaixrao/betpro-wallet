const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

/**
 * Har login session ke liye alag axios client + cookie jar banata hai.
 * Isi client ke through hi future requests (cash page, deposit, withdraw)
 * bheji jayengi taake session cookies automatically attach hoti rahein.
 *
 * serializedJar (optional): agar disk se purana jar mil jaye (server restart
 * ke baad), to naya CookieJar banane ki bajaye usi ko restore kar lete hain,
 * taake login dobara na karna paray.
 */
function createBetProClient(serializedJar) {
  let jar;

  if (serializedJar) {
    try {
      jar = CookieJar.deserializeSync(serializedJar);
    } catch (err) {
      console.error(
        "Cookie jar restore nahi hua, naya jar bana rahe hain:",
        err.message,
      );
      jar = new CookieJar();
    }
  } else {
    jar = new CookieJar();
  }

  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 30000,
      maxRedirects: 5,
      // Manually status check karenge, axios ko throw nahi karne dena
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    }),
  );

  return { client, jar };
}

module.exports = { createBetProClient };
