
export interface UploadState {
  file?: File
  objectKey?: string
  md5Hash?: string
  sha256sum?: string
  checkpoint?: string
  uploadedParts?: any[]
  fileName?: string
  fileSize?: number
  
  accessKeyId?: string
  accessKeySecret?: string
  stsToken?: string
  bucket?: string
  region?: string
  expiration?: string 
}


export interface UploadData {
  client: any               
  file: File                
  objectKey: string         
  retryLimit?: number       
  md5Hash?: string          
  sha256sum?: string        
  checkpoint?: string       
  uploadedParts?: any[]     
  autoRetry?: boolean       
}


export interface UploadInfo {
  fileName: string          
  speed?: string            
  status?: string           
}


export interface UploadProps {
  modelType?: string        
  fileName?: string         
  accept?: string           
}


export interface UploadSuccessData {
  sha256sum: string         
  object_key?: string       
  path?: string             
}


export interface RetryTimeout {
  timeout: number           
  seconds: number           
}


export interface OssClientResponse {
  oss: any                 
  objectKey: string        
  md5Hash: string          
  sha256sum: string        
  fileId?: string          
  credentials?: {          
    accessKeyId: string
    accessKeySecret: string
    stsToken: string
    bucket: string
    region: string
    expiration: string
  }
} 