import { customFetch } from '@/utils/customFetch'

//查询年度消费账单
export function get_year_cost(params: any) {
  return customFetch(`/bizyair/invoices/year_cost?${new URLSearchParams(params).toString()}`, {
    method: 'GET'
  })
}

// 查询月度消费账单
export function get_month_cost(params: any) {
  return customFetch(`/bizyair/invoices/month_cost?${new URLSearchParams(params).toString()}`, {
    method: 'GET'
  })
}
//查询单日消费账单
export function get_day_cost(params: any) {
  return customFetch(`/bizyair/invoices/day_cost?${new URLSearchParams(params).toString()}`, {
    method: 'GET'
  })
}

// 查询最近消费记录
export function get_recent_consumption(params: any) {
  return customFetch(`/bizyair/invoices/recent_cost?${new URLSearchParams(params).toString()}`, {
    method: 'GET'
  })
}
