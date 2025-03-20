import { customFetch } from '@/utils/customFetch'

export const payProduct = (product_id: string, platform: string) => customFetch(`/bizyair/user/buy`, { 
    method: 'POST', 
    body: JSON.stringify({ 
        product_id,
        platform
    }) 
})

export const getOrdersStatus = (order_no: string) => customFetch(`/bizyair/user/pay/orders?order_no=${order_no}`, { method: 'GET' }, false, false)

export const delOrder = (order_no: string) => customFetch(`/bizyair/user/pay/orders`, { 
    method: 'DELETE',
    body: JSON.stringify({ order_no })
})

export const getProducts = () => customFetch(`/bizyair/user/products`, { method: 'GET' })

export const getPayPage = (param: any) => {
    console.log(param)
    return customFetch(`/bizyair/user/pay/page?${new URLSearchParams(param).toString()}`, { method: 'GET' })
}