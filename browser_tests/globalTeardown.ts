import { FullConfig } from '@playwright/test'
import { killComfy } from './comfyProc'

export default function globalTeardown(config: FullConfig) {
  killComfy()
}
