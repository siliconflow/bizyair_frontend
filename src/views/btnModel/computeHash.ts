import { createCRC64, createMD5, createSHA256 } from "hash-wasm";

interface FileReaderEventTarget extends EventTarget {
  result: string | ArrayBuffer | null;
}

interface FileReaderEvent extends ProgressEvent {
  target: FileReaderEventTarget | null;
}

export async function calculateHash(file: File | Blob): Promise<any> {
  const chunkSize = 1024 * 1024; // 1MB chunks

  const md5Hasher = await createMD5();
  const crc64Hasher = await createCRC64();
  const sha256Hasher = await createSHA256();

  md5Hasher.init();
  crc64Hasher.init();
  sha256Hasher.init();

  const fileSize = file.size;
  let offset = 0;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const readNextChunk = () => {
      if (offset >= fileSize) {
        const md5Hash = md5Hasher.digest();
        const crc64Hash = crc64Hasher.digest();
        const flippedCrc64 = BigInt("0x" + crc64Hash).toString(10);
        const base64Md5 = btoa(
          String.fromCharCode(...new Uint8Array(md5Hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16))))
        );
        sha256Hasher.update(`${base64Md5}${flippedCrc64}`);
        const sha256Hash = sha256Hasher.digest();

        resolve({ sha256sum: sha256Hash, md5Hash: base64Md5, crc64Hash });
        return;
      }

      const blob = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(blob);
    };

    reader.onload = (e: FileReaderEvent) => {
      if (!e.target || !e.target.result) {
        reject(new Error("FileReader result is null"));
        return;
      }

      const arrayBuffer = e.target.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);

      md5Hasher.update(uint8Array);
      crc64Hasher.update(uint8Array);

      offset += arrayBuffer.byteLength;
      readNextChunk();
    };

    reader.onerror = (e) => {
      console.log('错误了', e);
      reject(new Error("FileReader error"));
    };

    readNextChunk();
  });
}

export async function calculateMd5Hash(file: File | Blob): Promise<string> {
  const chunkSize = 1024 * 1024; // 1MB chunks

  const md5Hasher = await createMD5();
  md5Hasher.init();

  const fileSize = file.size;
  let offset = 0;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const readNextChunk = () => {
      if (offset >= fileSize) {
        const md5Hash = md5Hasher.digest();
        resolve(md5Hash);
        return;
      }

      const blob = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(blob);
    };

    reader.onload = (e: FileReaderEvent) => {
      if (!e.target || !e.target.result) {
        reject(new Error("FileReader result is null"));
        return;
      }

      const arrayBuffer = e.target.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);

      md5Hasher.update(uint8Array);

      offset += arrayBuffer.byteLength;
      readNextChunk();
    };

    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };

    readNextChunk();
  });
}