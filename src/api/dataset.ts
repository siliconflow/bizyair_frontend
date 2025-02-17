import { customFetch } from '@/utils/customFetch'

export const create_dataset = (data: any) => customFetch(`/bizyair/community/datasets?clientId=${sessionStorage.getItem('clientId')}`, {
  method: 'POST',
  body: JSON.stringify(data)
})

export const put_dataset = (data: any) => customFetch(`/bizyair/community/datasets/${data.id}?clientId=${sessionStorage.getItem('clientId')}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

export const del_datasets = (data: { id: number }) => customFetch(`/bizyair/community/datasets/${data.id}`, { method: 'DELETE' })

export const get_datasets = (query: any, data: any) => customFetch(`/bizyair/community/datasets/query?${new URLSearchParams(query).toString()}`, { 
    method: 'POST',
    body: JSON.stringify(data)
  }, false)

export const get_datasets_detail = (data: any) => customFetch(`/bizyair/community/datasets/${data.id}/detail`, { method: 'GET' })


// export const get_dataset = (id: number) => customFetch(`/bizyair/community/datasets/${id}`)