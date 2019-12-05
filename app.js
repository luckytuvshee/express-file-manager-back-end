var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var fs = require("fs");
var app = express();
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));

var contents = [];

function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(entry) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
}

function isDir(path) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

function deleteFile(path, isFolder) {
  if (isFolder) {
    rimraf(path);
  } else {
    fs.unlinkSync(path);
  }
}

function getContent(dirName) {
  fs.readdirSync(__dirname).forEach(file => {
    contents.push({
      file,
      dir: __dirname,
      path: __dirname + "/" + file,
      is_dir: isDir(__dirname + "/" + file)
    });
  });
}

function changeName(newPath, oldPath) {
  fs.rename(oldPath, newPath, function(err) {
    if (err) console.log("ERROR: " + err);
  });
}

function addDir(currentDir, newDirName) {
  fs.mkdirSync(currentDir + "/" + newDirName);
}

app.get("/", (req, res) => {
  getContent(__dirname);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ contents, currentDir: __dirname }));
});

app.get("/:folder", (req, res) => {
  getContent(req.params.folder);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ contents, currentDir: __dirname }));
});

app.post("/changeName", (req, res) => {
  getContent(__dirname);
  changeName(req.body.newPath, req.body.oldPath);
  res.send(JSON.stringify(contents));
});

app.post("/delete", (req, res) => {
  deleteFile(req.body.file, req.body.isFolder);
  getContent(__dirname);
  res.send(JSON.stringify(contents));
});

app.post("/addDir", (req, res) => {
  getContent(__dirname);
  addDir(req.body.currentDir, req.body.dirName);
  res.send(JSON.stringify(contents));
});

app.listen(3000);
