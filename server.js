// server.js
const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;
const BASE_URL = "https://your-render-name.onrender.com"; // 🟢 Replace with your actual Render URL

// Setup uploads folder
const uploadFolder = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Upload route
server.post("/upload", upload.single("media"), (req, res) => {
  const file = req.file;
  const fullUrl = `${BASE_URL}/uploads/${file.filename}`;

  const newItem = {
    id: Date.now(),
    userId: req.body.userId,
    url: fullUrl,
    type: req.body.type || "video",
    challenge: req.body.challenge || null,
    timestamp: new Date().toISOString(),
  };

  // Save to db.json
  const db = router.db;
  const current = db.get("posts"); // assumes 'posts' collection in db.json
  current.push(newItem).write();

  res.status(201).json(newItem);
});

// Serve uploaded files
server.use("/uploads", jsonServer.router("public/uploads"));

server.use(router);
server.listen(PORT, () => {
  console.log(`JSON Server is running at ${PORT}`);
});
