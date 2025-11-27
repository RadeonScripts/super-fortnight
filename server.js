import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const rateLimitMap = new Map(); // Stores: userId -> timestamp
const RATE_LIMIT_SECONDS = 60; // One request per 60 seconds

const app = express();
app.use(bodyParser.json());

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

app.post("/send", async (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).send({ error: "Missing userId in request." });
    }

    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(userId);

    if (lastRequestTime && (now - lastRequestTime) < RATE_LIMIT_SECONDS * 1000) {
        return res.status(429).send({
            error: "Rate limit exceeded. You must wait before sending again.",
            retryAfter: (RATE_LIMIT_SECONDS - Math.floor((now - lastRequestTime) / 1000))
        });
    }

    // Update rate limit timestamp
    rateLimitMap.set(userId, now);

    // Forward message to Discord
    try {
        const response = await fetch(process.env.DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        return res.status(200).send({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ ok: false });
    }
});


app.listen(10000, () => console.log("Relay running on port 10000"));
