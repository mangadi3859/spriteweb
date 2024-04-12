import express from "express";
import path from "path";
import Socket from "socket.io";
import multer from "multer";
import fs from "node:fs";
import { createServer } from "http";

//Modules
import convertWebp from "./server/webptopng";
import processImage, { Slice } from "./server/processImg";

//Constants
const app = express();
const server = createServer(app);
const io = new Socket.Server(server);
const ROOT = path.join(__dirname, "public");
const ROOT_TMP = path.join(__dirname, "tmp");
const VIEW_ROOT = path.join(__dirname, "view");
const upload = multer({ dest: ROOT_TMP, preservePath: true });
const PORT = 8080;
const DEFAULT_SLICES = 13;
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;
const cd = new Set<string>();

//Initalization
app.set("view engine", "ejs");
app.set("views", VIEW_ROOT);
app.use("/public", express.static(ROOT));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routers
app.get("/public", (req, res) => res.sendStatus(403));
app.get("/public/**", (req, res) => res.sendStatus(403));

//Middleware
app.get("/", (req, res) => res.render("index"));
app.post("/process", upload.single("sprite"), (req, res) => {
    res.redirect(`/modify/${req.file?.filename}?type=${req.file?.mimetype}`);
});
app.get("/modify/:id", async (req, res) => {
    if (!req.params.id || !fs.existsSync(path.join(ROOT_TMP, req.params.id)) || !req.query?.type) {
        return res.redirect("/");
    }

    let base64: string;
    if (req.query.type !== "image/png") {
        if (!fs.existsSync(path.join(ROOT_TMP, req.params.id + ".png"))) {
            await convertWebp(path.join(ROOT_TMP, req.params.id));
        }

        let sprite = await processImage(
            path.join(ROOT_TMP, req.params.id + ".png"),
            Array(DEFAULT_SLICES)
                .fill(0)
                .map((e) => [0, 0])
        );
        base64 = `data:image/png;base64,${sprite.toString("base64")}`;
    } else {
        let sprite = await processImage(path.join(ROOT_TMP, req.params.id), Array(DEFAULT_SLICES).fill(0));
        base64 = `data:image/png;base64,${sprite.toString("base64")}`;
    }
    res.render("modify", { base64, slices: DEFAULT_SLICES, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, tmp: req.params.id });
});

//Socket Stuff
io.on("connection", (socket) => {
    socket.emit("ping", "Connected to websocket server");

    socket.on("update", async (size: { height: number; width: number }, slices: Slice[], id: string) => {
        if (cd.has(socket.id)) return;
        cd.add(socket.id);
        setTimeout(() => cd.delete(socket.id), 100);

        let filepath = getTempPath(id);
        let sprite = await processImage(filepath, slices, size);

        let base64 = `data:image/png;base64,${sprite.toString("base64")}`;
        socket.emit("result", base64);
    });
});

//Run
clearTmp();
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

function clearTmp() {
    fs.readdirSync(ROOT_TMP).forEach((file) => !file.endsWith(".txt") && fs.unlinkSync(`${ROOT_TMP}/${file}`));
}

function getTempPath(name: string): string {
    return fs.existsSync(path.join(ROOT_TMP, name + ".png")) ? path.join(ROOT_TMP, name + ".png") : path.join(ROOT_TMP, name);
}
