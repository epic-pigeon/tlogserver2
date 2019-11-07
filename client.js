const net = require("net");
const fs = require("fs");
const childProcess = require("child_process");

const client = net.createConnection({
   host: "3.89.196.174",
   port: 6702
});

let fullData = "";

client.on("data", chunk => {
    fullData += chunk.toString();
    if (fullData.charCodeAt(fullData.length - 1) === 0) {
        fullData = fullData.substring(0, fullData.length - 1);
        const filename = "" + + + + + + + + + + + + Date.now();
        fs.writeFile("./" + filename + ".tlog", Buffer.from(fullData, "base64").toString(), err => {
            if (err) throw err;
            let result = "";
            const process = childProcess.spawn("./TLogReaderV5.exe", ["./" + filename + ".tlog"]);
            process.stdout.on("data", chunk => result += chunk);
            process.on("exit", function (code) {
                if (code !== 0) throw new Error("bad code " + code);
                client.write(result + "\0");
            })
        });
    }
});