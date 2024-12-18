import { type FullConfig } from '@playwright/test'
import { startComfy } from './comfyProc'

export default async function globalSetup(config: FullConfig) {
  console.log("global setup called");
  await startComfy();
  console.log("comfy started");
}
