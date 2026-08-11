import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const port = 4313;
const baseUrl = `http://127.0.0.1:${port}`;
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
let server;

before(async () => {
  server = spawn(process.execPath, [nextCli, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: projectRoot,
    env: { ...process.env, FINACCESS_API_URL: "https://finaccess-eswatini-api.onrender.com" },
    stdio: "ignore",
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Next.js production server did not become ready.");
});

after(() => {
  server?.kill();
});

async function render(path = "/") {
  return fetch(`${baseUrl}${path}`, { headers: { accept: "text/html" } });
}

test("renders Signal as the selected homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Financial Access in Eswatini/);
  assert.match(html, /Start an assessment/);
  assert.match(html, /Review the evidence/);
  assert.match(html, /Developed by Thando F\. Dlamini/);
  assert.doesNotMatch(html, /Choose how the evidence should feel|Three complete directions/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton|Starter Project/i);
});

for (const [slug, name] of [["ledger", "The Ledger"], ["open-field", "Open Field"], ["signal", "Signal"]]) {
  test(`renders the ${name} product direction`, async () => {
    const response = await render(`/concepts/${slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(name));
    assert.match(html, /Financial Access in Eswatini/);
    assert.match(html, /43\.1%/);
    assert.match(html, /50\.4%/);
    assert.match(html, /Financial inclusion/);
    assert.match(html, /Mobile money/);
    assert.match(html, /Assessment/);
    assert.match(html, /Methodology/);
    assert.match(html, /World Bank Global Findex 2025 microdata/);
    assert.match(html, /Developed by Thando F\. Dlamini/);
  });
}

test("declares the generated social preview image", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /og:image/);
  assert.match(html, /\/og\.png/);
  assert.match(html, /summary_large_image/);
});
