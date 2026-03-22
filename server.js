const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ HOME
app.get("/", (req, res) => {
    res.send("SnapFetch PRO API 🚀");
});

// ✅ VIDEO INFO (QUALITY LIST)
app.get("/info", (req, res) => {

    const url = req.query.url;

    if (!url) {
        return res.json({ status: "error", message: "No URL" });
    }

    const command = `yt-dlp -j "${url}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {

        if (err) {
            console.log("ERROR:", err);
            return res.json({ status: "error", message: "Failed" });
        }

        try {
            const data = JSON.parse(stdout);

            const formats = [];

            data.formats.forEach(f => {
                if (f.url && f.height) {
                    formats.push({
                        quality: f.height + "p",
                        url: f.url
                    });
                }
            });

            // remove duplicates
            const unique = [];
            const seen = {};

            formats.forEach(f => {
                if (!seen[f.quality]) {
                    seen[f.quality] = true;
                    unique.push(f);
                }
            });

            res.json({
                status: "success",
                title: data.title,
                thumbnail: data.thumbnail,
                formats: unique
            });

        } catch (e) {
            res.json({ status: "error", message: "Parsing error" });
        }
    });
});

// ✅ DIRECT DOWNLOAD (BEST QUALITY)
app.get("/download", (req, res) => {

    const url = req.query.url;

    if (!url) {
        return res.json({ status: "error" });
    }

    const command = `yt-dlp -f best -g "${url}"`;

    exec(command, (err, stdout, stderr) => {

        if (err) {
            return res.json({ status: "error" });
        }

        res.json({
            status: "success",
            video: stdout.trim()
        });
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
