import { customFetch } from '@/utils/customFetch'

export const check_model_exists = (type: string, name: string) =>
  customFetch('/bizyair/modelhost/check_model_exists', {
    method: 'POST',
    body: JSON.stringify({ type, name })
  })

export const model_upload = (data: any) =>
  customFetch('/bizyair/modelhost/model_upload', {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const models_files = (params: any, data: any) =>
  customFetch(`/bizyair/community/models/query?${new URLSearchParams(params).toString()}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const change_public = (data: any) =>
  customFetch('/bizyair/modelhost/models/change_public', {
    method: 'PUT',
    body: JSON.stringify(data)
  })

export const base_model_types = () =>
  customFetch('/bizyair/community/base_model_types', { method: 'GET' })

export const get_model_list = (params: any, data: any) =>
  customFetch(
    `/bizyair/community/models/query?${new URLSearchParams(params).toString()}`,
    {
      method: 'POST',
      body: JSON.stringify(data)
    },
    false
  )

export const check_folder = (url: string) =>
  customFetch(`/bizyair/modelhost/check_folder?absolute_path=${encodeURIComponent(url)}`, {
    method: 'GET'
  })

export const del_models = (data: { type: string; name: string }) =>
  customFetch('/bizyair/modelhost/models', {
    method: 'DELETE',
    body: JSON.stringify({
      type: data.type,
      name: data.name
    })
  })

export const get_description = (data: any) =>
  customFetch(`/bizyair/modelhost/models/description?${new URLSearchParams(data).toString()}`, {
    method: 'get'
  })

export const put_description = (data: any) =>
  customFetch('/bizyair/modelhost/models/description', {
    method: 'put',
    body: JSON.stringify(data)
  })

export const create_models = (data: any) =>
  customFetch(`/bizyair/community/models?clientId=${sessionStorage.getItem('clientId')}`, {
    method: 'post',
    body: JSON.stringify(data)
  })

export const check_local_file = (data: any) =>
  customFetch(`/bizyair/community/check_local_file?${new URLSearchParams(data).toString()}`, {
    method: 'get'
  })

export const submit_upload = (data: any) =>
  customFetch(`/bizyair/community/submit_upload?clientId=${sessionStorage.getItem('clientId')}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const interrupt_upload = (data: any) =>
  customFetch(
    `/bizyair/community/interrupt_upload?clientId=${sessionStorage.getItem('clientId')}`,
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  )

export const model_types = () => customFetch('/bizyair/community/model_types', { method: 'GET' })

export const put_model = (data: any) =>
  customFetch(
    `/bizyair/community/models/${data.id}?clientId=${sessionStorage.getItem('clientId')}`,
    {
      method: 'put',
      body: JSON.stringify(data)
    }
  )

export const model_detail = (data: any) =>
  customFetch(`/bizyair/community/models/${data.id}/detail?source=${data.source}`, {
    method: 'GET'
  })

export const remove_model = (id: string | number) =>
  customFetch(`/bizyair/community/models/${id}`, {
    method: 'DELETE'
  })

export const like_model = (model_version_id: any) =>
  customFetch(`/bizyair/community/models/like/${model_version_id}`, {
    method: 'POST'
  })

export const fork_model = (model_version_id: any) =>
  customFetch(`/bizyair/community/models/fork/${model_version_id}`, {
    method: 'POST'
  })

export const un_fork_model = (model_version_id: any) =>
  customFetch(`/bizyair/community/models/fork/${model_version_id}`, {
    method: 'DELETE'
  })

export const commit_file = (data: any) =>
  customFetch('/bizyair/community/commit_file', {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const get_workflow_dowload_url = (model_version_id: any, sign: any) =>
  customFetch(`/bizyair/community/models/versions/${model_version_id}/workflow_json/${sign}`, {
    method: 'GET'
  })

export const get_all_model_tags = () => customFetch('/bizyair/tags/all', { method: 'GET' })

export const create_share_code = ({
  biz_id,
  type = 'bizy_model_version'
}: {
  biz_id: number
  type?: string
}) =>
  customFetch(`/bizyair/community/share`, {
    method: 'POST',
    body: JSON.stringify({ biz_id, type })
  })

export const get_share_code = ({ code }: { code: string }) =>
  customFetch(`/bizyair/community/share/${code}`, {
    method: 'GET'
  })

export const version_get_model = ({ id }: { id: string }) =>
  customFetch(`/bizyair/community/model_version/${id}`, {
    method: 'GET'
  })
