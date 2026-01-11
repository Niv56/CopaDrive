const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "localData.json");

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}


module.exports = {
  name: "local",
  readDB,
};
