const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`BetPro wallet test backend running on http://localhost:${PORT}`);
});
