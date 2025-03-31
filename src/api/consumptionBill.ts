import { customFetch } from '@/utils/customFetch'

// 消费账单接口参数
export interface ConsumptionBillParams {
  api_key?: string
  month?: string
  year?: string
  day?: string
  page?: number
  page_size?: number
}

// 消费账单数据项接口
export interface BillItem {
  month?: string // 月份，如 "2023-01"
  day?: string // 日期，如 "2023-01-15"
  hour?: string // 小时，如 "12:00-12:59"
  prompt_id?: string // Prompt ID
  total_amount?: number // 总金额
  gold_coin?: number // 金币抵扣
  silver_coin?: number // 银币抵扣
}

//查询年度消费账单
export function get_year_cost(params: any) {
  console.log(params, 'params')

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
