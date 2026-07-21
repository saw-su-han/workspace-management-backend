import app from "./app.js";

const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: Your .env file is NOT being read by the application!");
  process.exit(1);
}

app.listen(Number(PORT), "0.0.0.0", () => {
  // console.log(`Server running on http://0.0.0.0:${PORT}`);
});