const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ HOME
app.get("/", (req, res) => {
    res.send("SnapFetch PRO MAX ⚡");
});

// 🚀 FAST VIDEO INFO (OPTIMIZED)
app.get("/info", (req, res) => {

    const url = req.query.url;

    if (!url) {
        return res.json({ status: "error", message: "No URL" });
    }

    // ⚡ FAST yt-dlp (no extra data)
    const command = `yt-dlp -j --no-warnings --no-playlist "${url}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {

        if (err) {
            return res.json({ status: "error", message: "Extraction failed" });
        }

        try {
            const data = JSON.parse(stdout);

            let formats = [];

            data.formats.forEach(f => {

                // ✅ FILTER ONLY GOOD FORMATS
                if (
                    f.url &&
                    f.ext === "mp4" &&
                    f.height &&
                    f.vcodec !== "none"
                ) {
                    formats.push({
                        quality: f.height + "p",
                        url: f.url,
                        height: f.height
                    });
                }
            });

            // ❌ NO FORMAT FOUND
            if (formats.length === 0) {
                return res.json({ status: "error", message: "No formats" });
            }

            // 🔥 REMOVE DUPLICATES (KEEP BEST)
            const bestMap = {};

            formats.forEach(f => {
                if (!bestMap[f.height]) {
                    bestMap[f.height] = f;
                }
            });

            let cleanFormats = Object.values(bestMap);

            // 🔥 SORT (HIGH → LOW)
            cleanFormats.sort((a, b) => b.height - a.height);

            // 🔥 LIMIT (MAX 6 OPTIONS)
            cleanFormats = cleanFormats.slice(0, 6);

            // 🔥 FINAL RESPONSE
            res.json({
                status: "success",
                title: data.title,
                thumbnail: data.thumbnail,
                formats: cleanFormats.map(f => ({
                    quality: f.quality,
                    url: f.url
                }))
            });

        } catch (e) {
            res.json({ status: "error", message: "Parsing failed" });
        }
    });
});

// ⚡ DIRECT BEST QUALITY
app.get("/download", (req, res) => {

    const url = req.query.url;

    if (!url) {
        return res.json({ status: "error" });
    }

    const command = `yt-dlp -f best[ext=mp4] -g "${url}"`;

    exec(command, (err, stdout) => {

        if (err) {
            return res.json({ status: "error" });
        }

        res.json({
            status: "success",
            video: stdout.trim()
        });
    });
});

// 🚀 START
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
