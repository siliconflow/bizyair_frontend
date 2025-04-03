export const RETRY_INTERVALS = {
  FIRST: 10 * 1000,
  SECOND: 3 * 60 * 1000,
  THIRD: 10 * 60 * 1000
}

export const MAX_RETRY_COUNT = 3

export const CREDENTIAL_SAFETY_BUFFER = 5 * 60 * 1000

export const MULTIPART_UPLOAD_CONFIG = {
  PARALLEL: 2,
  PART_SIZE: 5 * 1024 * 1024
}

export const DEFAULT_ALLOWED_EXTENSIONS = '.safetensors, .pth, .bin, .pt, .ckpt, .gguf, .sft'

export const STORAGE_KEY_PREFIX = 'upload_'
