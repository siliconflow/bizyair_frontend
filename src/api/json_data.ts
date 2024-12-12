import { customFetch } from '@/utils/customFetch'

export const showcases = () => fetch('api/bizyair/showcases', { method: 'GET' }).then(response => response.json())

export const bizyair_workflow = (data: any) =>
  customFetch('/bizyair/workflow', {
    method: 'post',
    body: JSON.stringify(data)
  })
