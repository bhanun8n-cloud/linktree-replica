// Viewport screenshots at key widths (top of page + footer) for visual review.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

const PORT = 9333;
const BASE = "http://localhost:3000";
const OUT = "artifacts/shots";

const db = new DatabaseSync("data/linktree.db");
const session = db
  .prepare("SELECT token FROM sessions WHERE expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now') ORDER BY expires_at DESC LIMIT 1")
  .get()?.token ?? "";

const widths = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1440", width: 1440, height: 900, mobile: false },
];

const pages = (process.argv[2] ?? "home,profile,admin,links,design,insights,pricing,discover").split(",");
const targets = {
  home: "/",
  pricing: "/pricing",
  discover: "/discover",
  login: "/login",
  profile: "/demo",
  admin: "/admin",
  links: "/admin/links",
  header: "/admin/header",
  design: "/admin/design",
  insights: "/admin/insights",
  audience: "/admin/audience",
  earn: "/admin/earn",
  account: "/admin/account",
  planner: "/admin/social-planner",
  messaging: "/admin/messaging",
  ideas: "/admin/post-ideas",
  cards: "/admin/business-cards",
  shortener: "/admin/link-shortener",
  mediakit: "/admin/media-kit",
  igdm: "/admin/igdm",
};

const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
await send("Page.enable");
await send("Network.enable");
await send("Network.setCookie", { name: "lt_session", value: session, url: BASE, path: "/" });

fs.mkdirSync(OUT, { recursive: true });
for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: width.width,
    height: width.height,
    deviceScaleFactor: 1,
    mobile: width.mobile,
  });
  for (const page of pages) {
    const path = targets[page];
    if (!path) continue;
    await send("Page.navigate", { url: `${BASE}${path}` });
    await new Promise((r) => setTimeout(r, 2500));
    const top = await send("Page.captureScreenshot", { format: "jpeg", quality: 80 });
    fs.writeFileSync(`${OUT}/${page}-${width.name}-top.jpg`, Buffer.from(top.result.data, "base64"));
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, document.body.scrollHeight)" });
    await new Promise((r) => setTimeout(r, 600));
    const bottom = await send("Page.captureScreenshot", { format: "jpeg", quality: 80 });
    fs.writeFileSync(`${OUT}/${page}-${width.name}-bottom.jpg`, Buffer.from(bottom.result.data, "base64"));
    console.log("shot", page, width.name);
  }
}
ws.close();
process.exit(0);
