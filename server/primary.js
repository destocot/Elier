const cluster = require("cluster");
const os = require("os");
const path = require("path");
const { fileURLToPath } = require("url");

const cpuCount = os.cpus().length;

console.log(`The total number of CPUS is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);
cluster.setupPrimary({
  exec: path.join(__dirname, 'server.js'),
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
};

cluster.on("exit", (worker, code, signal) => {
  console.log(`worker ${worker.process.pid} has been killed`);
  console.log("Starting another worker");
  cluster.fork();
})