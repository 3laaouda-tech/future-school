import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { testConnection } from "./config/db";

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
