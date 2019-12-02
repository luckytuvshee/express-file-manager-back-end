var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var fs = require("fs");
var app = express();
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));

var contents = [];

function isDir(path) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

fs.readdirSync(__dirname).forEach(file => {
  contents.push({
    file,
    dir: __dirname,
    path: __dirname + "/" + file,
    is_dir: isDir(__dirname + "/" + file)
  });
});

function changeName(newPath, oldPath) {
  fs.rename(oldPath, newPath, function(err) {
    if (err) console.log("ERROR: " + err);
  });
}

function addDir(currentDir, newDirName) {
  fs.mkdirSync(currentDir + "/" + newDirName);
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ contents, currentDir: __dirname }));
});

app.post("/changeName", (req, res) => {
  changeName(req.body.newPath, req.body.oldPath);
  res.send(JSON.stringify(contents));
});

app.post("/addDir", (req, res) => {
  addDir(req.body.currentDir, req.body.dirName);
  res.send(JSON.stringify(contents));
});

app.listen(3000);
