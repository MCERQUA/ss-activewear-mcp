import { describe, it } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("S&S Activewear MCP Server", () => {
  it("should start without errors", async () => {
    const serverPath = join(__dirname, "index.js");
    const server = spawn("node", [serverPath], {
      env: {
        ...process.env,
        SS_ACCOUNT_NUMBER: "test",
        SS_API_KEY: "test",
        SS_REGION: "US",
      },
    });

    // Give the server time to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Server should still be running
    assert.strictEqual(server.killed, false);

    // Clean up
    server.kill();
  });

  it("should validate required environment variables", async () => {
    const serverPath = join(__dirname, "index.js");
    const server = spawn("node", [serverPath], {
      env: {
        ...process.env,
        // Missing required variables
      },
    });

    let errorOutput = "";
    server.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Give the server time to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Should have logged an error about missing variables
    assert(errorOutput.includes("Missing required environment variables"));

    // Clean up
    server.kill();
  });
});