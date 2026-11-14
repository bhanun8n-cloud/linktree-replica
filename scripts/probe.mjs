import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/linktree.db");
const session = db
  .prepare("SELECT token FROM sessions WHERE expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now') ORDER BY expires_at DESC LIMIT 1")
  .get()?.token ?? "";

const path = process.argv[2] ?? "/admin/links";
const width = Number(process.argv[3] ?? 375);
const mobile = process.argv[5] !== "desktop";
const expression = process.argv[4] && process.argv[4] !== "-" ? process.argv[4] : `(() => {
  const de = document.documentElement;
  const meta = document.querySelector('meta[name="viewport"]')?.content ?? null;
  const out = { innerWidth: window.innerWidth, visual: window.visualViewport?.width, scale: window.visualViewport?.scale, dpr: devicePixelRatio, meta, scrollWidth: de.scrollWidth, bodyScroll: document.body.scrollWidth };
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.includes("Add collection"));
  if (btn) {
    const r = btn.getBoundingClientRect();
    out.btn = { left: r.left, right: r.right, width: r.width, parentRight: btn.parentElement.getBoundingClientRect().right };
    out.parents = [];
    let el = btn;
    while (el && out.parents.length < 6) {
      const rect = el.getBoundingClientRect();
      out.parents.push({ tag: el.tagName, cls: String(el.className).slice(0, 90), left: rect.left, right: rect.right, scroll: el.scrollWidth, client: el.clientWidth });
      el = el.parentElement;
    }
  }
  return JSON.stringify(out);
})()`;

const target = await (await fetch("http://127.0.0.1:9333/json/new?about:blank", { method: "PUT" })).json();
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
await send("Network.setCookie", { name: "lt_session", value: session, url: "http://localhost:3000", path: "/" });
await send("Emulation.setDeviceMetricsOverride", { width, height: 812, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: `http://localhost:3000${path}` });
await new Promise((r) => setTimeout(r, 3000));
const res = await send("Runtime.evaluate", { expression, returnByValue: true });
console.log(res.result?.result?.value ?? JSON.stringify(res.result));
ws.close();
process.exit(0);
