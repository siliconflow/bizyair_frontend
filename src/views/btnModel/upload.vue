<template>
  <div 
    :class="[
      'hover:border-[hsl(var(--primary))] border-dashed border-2 border-[#9CA3AF] rounded-lg p-4 w-full border-box relative file-box',
      {'border-[hsl(var(--primary))]': isHighlighted}
    ]" 
    @dragenter="highlight" 
    @dragover="highlight" 
    @dragleave="unhighlight" 
    @drop="handleDrop">
    <div v-if="disableUpload" class="bg-black/80 cursor-not-allowed absolute left-0 top-0 w-full h-full z-10">
      <Button class="absolute z-20 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" @click="interrupt()" v-if="disableUpload">interrupt</Button>
    </div>
    <div class="w-11 h-11 mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="43" viewBox="0 0 44 43" fill="none">
        <path d="M38.125 26.875V34.0417C38.125 34.992 37.7475 35.9035 37.0755 36.5755C36.4035 37.2475 35.492 37.625 34.5417 37.625H9.45833C8.50797 37.625 7.59654 37.2475 6.92453 36.5755C6.25253 35.9035 5.875 34.992 5.875 34.0417V26.875M30.9583 14.3333L22 5.375M22 5.375L13.0417 14.3333M22 5.375V26.875" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p class="text-[rgba(156, 163, 175, 1)] text-center">{{ uploadText }}</p>
    <input class="cursor-pointer opacity-0 w-full h-full absolute left-0 top-0" type="file" multiple @change="handleFileChange">
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { useShadet } from '@/components/modules/vShadet/index';
import { Button } from '@/components/ui/button'
import { calculateHash, calculateMd5Hash } from './computeHash';
import OSS from 'ali-oss';
import { ossSign } from '@/api/public';
import { commit_file } from '@/api/model';


let calculatingDialog: any;
const uploadText = ref('Click or drag file to this area to upload');
const disableUpload = ref(false)

defineProps<{
// const props = defineProps<{
  parallel: number;
  chunkSize: number;
}>();

const isHighlighted = ref(false);

function preventDefaults(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e: DragEvent) {
  preventDefaults(e);
  isHighlighted.value = true;
}

function unhighlight(e: DragEvent) {
  preventDefaults(e);
  isHighlighted.value = false;
}

function handleDrop(e: DragEvent) {
  preventDefaults(e);
  unhighlight(e);
  const files = e.dataTransfer?.files;
  if (files) {
    handleFiles(files);
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    handleFiles(files);
  }
}

function handleFiles(files: FileList) {
  for (let i = 0; i < files.length; i++) {
    uploadFile(files[i]);
  }
}
const CHUNK_SIZE = 5 * 1024 * 1024; // 每片大小为 5MB

const emit = defineEmits(['progress', 'path', 'start', 'success', 'error']);
// const progress = ref(0);
// const onProgress = (p: number) => {
//   console.log(`upload progress: ${p}`);
//   progress.value = p;
//   emit('progress', Number((p * 100).toFixed(2)));
// };
interface doUploadData{
  client: any,
  file: File,
  objectKey: any,
  retryLimit?: number,
  md5Hash?: string,
  sha256sum?: string
}
async function doUpload(data: doUploadData){
  const {client, file, objectKey, retryLimit = 3, md5Hash, sha256sum} = data

  try {
    // console.log(client)
    // console.log(client.multipartUpload)
    // console.log(client.multipartUpload)

    // const result = await client.multipartUpload(objectKey, file, {
    //   progress: (p: any) => {
    //     onProgress(p);
    //   },
    //   parallel: props.parallel,
    //   partSize: props.chunkSize * 1024 * 1024, // 分片大小
    //   // headers: {
    //   //   'Content-Md5': md5Hash
    //   // },
    // });
    // const result = await client.put(objectKey, file, {
    //   progress: (p: any) => {
    //     onProgress(p);
    //   },
    //   parallel: props.parallel,
    //   partSize: props.chunkSize * 1024 * 1024,
    //   headers: {
    //     'Content-MD5': md5Hash,
    //   },
    // });
    // console.log(result)

    // Step 1: 计算文件的哈希值
    const { sha256sum, md5Hash, crc64Hash } = await calculateHash(file);
    console.log("计算的哈希值:", { sha256sum, md5Hash, crc64Hash });

    // Step 2: 初始化分片上传
    const initResult = await client.initMultipartUpload(objectKey, {
      headers: {
        "x-oss-meta-md5": md5Hash, // 自定义文件元数据
      },
    });
    const uploadId = initResult.uploadId;
    console.log("初始化上传成功, uploadId:", uploadId);

    // Step 3: 分片上传
    const fileSize = file.size;
    let partNumber = 1;
    const parts = [];

    for (let offset = 0; offset < fileSize; offset += CHUNK_SIZE, partNumber++) {
      const blob = file.slice(offset, offset + CHUNK_SIZE);
      // const { md5Hash } = await calculateHash(blob);
      // console.log(await calculateHash(blob))
      const partMd5 = await calculateMd5Hash(blob);
      const result = await client.uploadPart(objectKey, uploadId, partNumber, blob, {
        headers: {
          "Content-MD5": partMd5,
        },
      });

      console.log(`分片 ${partNumber} 上传成功, ETag:`, result.etag);

      parts.push({
        partNumber,
        etag: result.etag,
      });
    }
    
    // Step 4: 完成上传
    const md5 = await calculateMd5Hash(file);
    const completeResult = await client.completeMultipartUpload(objectKey, uploadId, parts, {
      headers: {
        "Content-MD5": md5, // 整个文件的MD5
        "x-oss-hash-crc64ecma": crc64Hash,
        "x-oss-meta-signature": sha256sum, // 自定义签名
      },
    });


    return completeResult;
  } catch (e: any) {
    console.error(e);
    if (e.name === 'cancel') {
      return e;
    }
    // if (e.code === 'ConnectionTimeoutError') {
    // }
    if (retryLimit <= 0) {
      throw e;
    } else {
      console.log('重试上传');
      return await doUpload({
        client,
        file,
        objectKey,
        retryLimit: retryLimit - 1,
        md5Hash,
        sha256sum
      });
    }
  }
}
let client:any = null;

const interrupt = () => {
  // calculatingDialog && calculatingDialog.close()
  disableUpload.value = false
  client?.cancel()
}
async function uploadFile(file: File) {
  uploadText.value = file.name;
  emit('path', file.name);
  disableUpload.value = true
  calculatingDialog = useShadet({
    content: 'In hash calculation',
    z: 'z-12000'
  })
  const { sha256sum, md5Hash } = await calculateHash(file)
  calculatingDialog.close()
  let ossData = await ossSign(sha256sum)
  if (ossData.data.file.id) {
    emit('success', {sha256sum, path: file.name});
    emit('progress', 100);
    disableUpload.value = false
    return
  }
  const accessFile = ossData.data

  
  const accessKeyId = accessFile.file.access_key_id
  const accessKeySecret = accessFile.file.access_key_secret
  const bucket = accessFile.storage.bucket
  const stsToken = accessFile.file.security_token
  const region = accessFile.storage.region

  client = new OSS({
    accessKeyId,
    accessKeySecret,
    stsToken,
    bucket,
    region,
    secure: true
  })

  emit('start');
  const result = await doUpload({
    client,
    file,
    objectKey: accessFile.file.object_key,
    md5Hash,
    sha256sum
  });
  console.log(result)
  if (result.status === 0) {
    // 用户取消上传
    return Promise.reject('')
  } else if (result.res.status === 200) {
    console.log('Upload to OSS success:', result.res);
    // setTimeout(() => {
      await commit_file({
        sha256sum,
        object_key: accessFile.file.object_key
      })
    // }, 60000);
    disableUpload.value = false
    emit('success', {sha256sum, object_key: accessFile.file.object_key});
    return result.res;
  } else {
    emit('error');
    disableUpload.value = false
    throw new Error(`Upload to OSS failed: ${result.res.statusText}`);
  }
}

</script>

<style scoped>
.file-box:hover p {
  color: hsl(var(--primary));
}

.file-box:hover svg path {
  stroke: hsl(var(--primary));
}
</style>