const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve HTML files directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/user.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/user.html'));
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/borrow", require("./routes/borrowRoutes"));

sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
    console.log("Frontend served from: " + path.join(__dirname, '../frontend'));
  });
});
