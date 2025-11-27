import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

app.post("/send", async (req, res) => {
  try {
    const discordResponse = await fetch(WEBHOOK_URL, {
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
