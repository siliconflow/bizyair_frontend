import { spawn, execSync } from 'child_process'

var comfyProc = null
export const defaultComfyPort = 8188

export async function startComfy(portOffset: number = 0) {
  const port = defaultComfyPort + portOffset
  console.log(`starting comfy on port ${port}...`)
  comfyProc = spawn(
    'python',
    [`${process.env.COMFY_PATH}/main.py`, '--cpu', '--port', port.toString()],
    {
      detached: true
    }
  )
  comfyProc.on('error', function (err) {
    console.error(err)
  })
  comfyProc.on('close', code => {
    console.log(`Comfy process on ${port} close all stdio with code ${code}`)
  })
  comfyProc.on('exit', code => {
    console.log(`Comfy process on ${port} exited with code ${code}`)
  })
  comfyProc.stdout?.on('data', data => {
    console.log(`stdout: ${data}`)
  })
  waitComfy(port)
}

export function killComfy() {
  if (!comfyProc?.kill()){
    console.error("Failed to kill comfy process")
  }
  else
  {
    console.log("Comfy process killed")
  }
  comfyProc = null
}

export function waitComfy(port) {
  var r = execSync(`wait-for-it --service 127.0.0.1:${port} -t 60`)
  console.log(r.toString())
  console.log('comfy server is ready!')
}
