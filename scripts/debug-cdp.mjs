import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/linktree.db");
const row = db
  .prepare("SELECT token FROM sessions WHERE expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now') ORDER BY expires_at DESC LIMIT 1")
  .get();

const target = await (await fetch("http://127.0.0.1:9333/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method) events.push(msg);
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
console.log("cookie", JSON.stringify(await send("Network.setCookie", {
  url: "http://localhost:3000",
  name: "lt_session",
  value: row.token,
  path: "/",
})));
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/admin" });
await new Promise((r) => setTimeout(r, 5000));
const res = await send("Runtime.evaluate", {
  expression: `JSON.stringify({
    url: location.href,
    cookie: document.cookie,
    text: document.body.innerText.slice(0, 200),
    htmlLen: document.documentElement.outerHTML.length,
    h1: document.querySelector("h1")?.textContent ?? null
  })`,
  returnByValue: true,
});
console.log(res.result.result.value);
const statuses = events.filter((e) => e.method === "Network.responseReceived").map((e) => `${e.params.response.status} ${e.params.response.url}`);
console.log(statuses.slice(-10).join("\n"));
ws.close();
process.exit(0);
