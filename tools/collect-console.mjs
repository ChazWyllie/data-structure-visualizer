// tools/collect-console.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const url = process.argv[2] || "http://localhost:3000/data-structure-visualizer/";
const outDir = path.resolve("artifacts");
fs.mkdirSync(outDir, { recursive: true });

const ts = new Date().toISOString().replaceAll(":", "-");
const outFile = path.join(outDir, `browser-console-${ts}.jsonl`);
const stream = fs.createWriteStream(outFile, { flags: "a" });

function write(event) {
    stream.write(JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n");
}

(async () => {
    // Headed browser so you can click manually
    const browser = await chromium.launch({
        headless: false,
        // slowMo: 50, // optional: slows actions slightly for visibility
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    page.on("console", (msg) => {
        write({
            type: "console",
            level: msg.type(),
            text: msg.text(),
            location: msg.location(),
        });
    });

    page.on("pageerror", (err) => {
        write({ type: "pageerror", message: err.message, stack: err.stack });
    });

    page.on("requestfailed", (req) => {
        write({
            type: "requestfailed",
            url: req.url(),
            method: req.method(),
            failure: req.failure(),
        });
    });

    page.on("response", async (res) => {
        const status = res.status();
        if (status >= 400) {
            write({
                type: "badresponse",
                url: res.url(),
                status,
                statusText: res.statusText(),
            });
        }
    });

    // Navigate
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Keep capture running until you stop it
    console.log(`Capturing logs. Interact with the opened browser window.`);
    console.log(`Press Enter here to stop capture and save: ${outFile}`);

    const rl = readline.createInterface({ input, output });
    await rl.question("");
    rl.close();

    await browser.close();
    stream.end();

    console.log(`Captured browser diagnostics to: ${outFile}`);
})();
