import { exec, spawn } from 'child_process'
import { setTimeout } from 'timers/promises';

export var comfyProc = null

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function startComfy() {
  comfyProc = spawn("python",
    [`${process.env.COMFY_PATH}/main.py`, "--cpu"],
    {
      detached: true
    }
  );
  var comfyUp = false;
  comfyProc.stdout?.on('data', (data) => {
    console.log(`stdout: ${data}`);
    if (`${data}`.includes("Starting server")) {
        comfyUp = true;
    }
  });
  comfyProc.on("error", function(err){
    console.error(err);
  });
  comfyProc.on('close', (code) => {
    console.log(`Comfy process close all stdio with code ${code}`);
  });
  comfyProc.on('exit', (code) => {
    console.log(`Comfy process exited with code ${code}`);
  });
  const util = require("util");
  const aexec = util.promisify(exec);
  await aexec("wait-for-it --service 127.0.0.1:8188 -t 600");
  console.log("Comfy server is ready!")
}

export function killComfy() {
  comfyProc?.kill()
}
