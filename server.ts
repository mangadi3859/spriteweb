import express from "express";
import path from "path";
import Socket from "socket.io";
import multer from "multer";
import { createServer } from "http";

//Modules

//Constants
const app = express();
const server = createServer(app);
const io = new Socket.Server(server);
const ROOT = path.join(__dirname, "public");
const ROOT_TMP = path.join(__dirname, "tmp");
const VIEW_ROOT = path.join(__dirname, "view");
const upload = multer({ dest: ROOT_TMP });
const PORT = 8080;

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
    console.log(req);
    res.send("ok");
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
