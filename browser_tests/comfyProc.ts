import { spawn, execSync } from 'child_process'

var comfyProc = null

export async function startComfy() {
  console.log("starting comfy...")
  comfyProc = spawn('python', [`${process.env.COMFY_PATH}/main.py`, '--cpu'], {
    detached: true
  })
  comfyProc.on('error', function (err) {
    console.error(err)
  })
  comfyProc.on('close', code => {
    console.log(`Comfy process close all stdio with code ${code}`)
  })
  comfyProc.on('exit', code => {
    console.log(`Comfy process exited with code ${code}`)
  })
  comfyProc.stdout?.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  var r = execSync('wait-for-it --service 127.0.0.1:8188 -t 600')
  console.log(r.toString())
  console.log('comfy server is ready!')
}

export function killComfy() {
  comfyProc?.kill()
  comfyProc = null
}
