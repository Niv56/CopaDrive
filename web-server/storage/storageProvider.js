const mode = process.env.STORAGE_MODE || "tcp";

function getProvider() {
  if (mode === "local") return require("./localProvider");
  return require("./tcpProvider");
}

module.exports = { getProvider, mode };
