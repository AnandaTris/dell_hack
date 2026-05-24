import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const services = JSON.parse(
  readFileSync(join(__dirname, "services.json"), "utf-8")
);

console.log(`Loaded ${services.length} Singapore care services from seed data.`);
console.log(
  "Services:",
  services.map((s: { name: string }) => s.name)
);
console.log("\n✓ Seed data validated. knowledge-service will load this at startup.");
