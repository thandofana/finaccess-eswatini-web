import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
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
