const http = require("http");
const net = require("net");
//const url = require("url");
//const fs = require("fs");
//const childProcess = require("child_process");

let currentConnection = null;
let dataListener = null;

http.createServer((req, res) => {
    if (req.method === "POST") {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            //console.log(data);
            process(data);
        })
    } else res.end("");
    function process(data) {
        processData(data).then(output => {
            res.writeHead(200, {"Content-Type": "application/octet-stream"});
            res.end(output);
        }).catch(e => {
            res.writeHead(520, {"Content-Type": "text/plain"});
            res.end(e + "");
        });
    }
}).listen(8080);

function processData(data) {
    return new Promise((resolve, reject) => {
        if (currentConnection) {
            dataListener = result => {
                resolve(result);
            };
            currentConnection.write(data + '\0');
        } else {
            reject(new Error("No connection"));
        }
    });
}

net.createServer(connection => {
    if (currentConnection) {
        connection.end();
    } else {
        currentConnection = connection;
        connection.on("end", () => {
            currentConnection = null;
        });
        let fullData = "";
        connection.on("data", chunk => {
            fullData += chunk.toString();
            if (fullData.charCodeAt(fullData.length - 1) === 0) {
                fullData = fullData.substring(0, fullData.length - 1);
                if (typeof dataListener === "function") {
                    dataListener.apply(null, [fullData]);
                }
            }
        });
    }
}).listen(6702);
