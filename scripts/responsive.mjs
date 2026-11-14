// Responsive audit: drives headless Edge over CDP, checks horizontal overflow
// at mobile/tablet/desktop widths, and captures screenshots.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

const PORT = 9333;
const BASE = "http://localhost:3000";
const OUT = "artifacts/responsive";

const WIDTHS = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1440", width: 1440, height: 900, mobile: false },
];

const PAGES = [
  { path: "/", name: "home" },
  { path: "/pricing", name: "pricing" },
  { path: "/discover", name: "discover" },
  { path: "/login", name: "login" },
  { path: "/demo", name: "profile" },
  { path: "/admin", name: "admin" },
  { path: "/admin/links", name: "links" },
  { path: "/admin/header", name: "header" },
  { path: "/admin/design", name: "design" },
  { path: "/admin/insights", name: "insights" },
  { path: "/admin/audience", name: "audience" },
  { path: "/admin/earn", name: "earn" },
  { path: "/admin/account", name: "account" },
  { path: "/admin/link-shortener", name: "shortener" },
  { path: "/admin/business-cards", name: "cards" },
  { path: "/admin/media-kit", name: "mediakit" },
  { path: "/admin/messaging", name: "messaging" },
  { path: "/admin/social-planner", name: "planner" },
  { path: "/admin/igdm", name: "igdm" },
  { path: "/admin/post-ideas", name: "ideas" },
];

const SHOTS = new Set(["home", "profile", "admin", "links", "design", "insights"]);

function token() {
  const db = new DatabaseSync("data/linktree.db");
  const row = db
    .prepare("SELECT token FROM sessions WHERE expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now') ORDER BY expires_at DESC LIMIT 1")
    .get();
  return row?.token ?? "";
}

async function openTarget() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method && this.events.has(msg.method)) {
        for (const fn of this.events.get(msg.method)) fn(msg.params);
      }
    });
  }
  ready() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        this.events.get(method).delete(fn);
        resolve(params);
      };
      if (!this.events.has(method)) this.events.set(method, new Set());
      this.events.get(method).add(fn);
    });
  }
}

const session = token();
fs.mkdirSync(OUT, { recursive: true });

const target = await openTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.ready();
await cdp.send("Page.enable");
await cdp.send("Network.enable");
await cdp.send("Runtime.enable");
await cdp.send("Network.setCookie", {
  name: "lt_session",
  value: session,
  url: BASE,
  path: "/",
  httpOnly: true,
  sameSite: "Lax",
});

const report = [];
for (const width of WIDTHS) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: width.width,
    height: width.height,
    deviceScaleFactor: 1,
    mobile: width.mobile,
  });
  for (const page of PAGES) {
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: `${BASE}${page.path}` });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);
    await new Promise((r) => setTimeout(r, 700));
    const result = await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const W = ${width.width};
        const de = document.documentElement;
        const overflow = Math.max(de.scrollWidth, document.body.scrollWidth) - W;
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.right > W + 1;
          })
          .slice(0, 5)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || "").toString().slice(0, 70),
            right: Math.round(el.getBoundingClientRect().right),
          }));
        return JSON.stringify({
          url: location.pathname,
          overflow,
          wide,
          text: document.body.innerText.length,
          err: document.body.innerText.includes("Application error"),
        });
      })()`,
      returnByValue: true,
    });
    const data = JSON.parse(result.result.value);
    report.push({ width: width.name, page: page.name, ...data });

    if (SHOTS.has(page.name)) {
      const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true });
      fs.writeFileSync(`${OUT}/${page.name}-${width.name}.jpg`, Buffer.from(shot.data, "base64"));
    }
  }
}

const bad = report.filter((r) => r.overflow > 1 || r.err || r.text < 50);
console.log(JSON.stringify({ total: report.length, issues: bad, report }, null, 1));
cdp.ws.close();
process.exit(0);
