<template>
  <n-modal
    v-model:show="statusStore.showConsumptionBillDialog"
    size="huge"
    :bordered="false"
    :auto-focus="false"
    preset="card"
    :style="{ maxWidth: '800px' }"
  >
    <template #header>{{ $t('btnProfile.consumptionBill.title') }}</template>

    <div class="condition-container">
      <span>API Key：</span>
      <n-input
        v-model:value="queryParams.apiKey"
        class="filter-input"
        :placeholder="$t('btnProfile.consumptionBill.enterApiKey')"
        @keydown.enter="handleSearch"
      />
      <n-button type="primary" class="search-btn" @click="handleSearch">
        {{ $t('btnProfile.consumptionBill.search') }}
      </n-button>
    </div>

    <div class="tabs-container">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'yearly' }"
        @click="activeTab = 'yearly'"
      >
        年度账单
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'recent' }"
        @click="activeTab = 'recent'"
      >
        最近消费
      </div>
    </div>

    <template v-if="activeTab === 'yearly'">
      <div class="tab-header">
        <div class="tab-title-wrapper">
          <template v-if="currentBillLevel === 'yearly'">
            <span class="tab-title">年度账单</span>
          </template>
          <template v-else-if="currentBillLevel === 'monthly'">
            <span class="back-link" @click="backToYearly">
              <span class="back-text">返回</span>
            </span>
            <span class="tab-title">{{ selectedYear }} 月度账单</span>
          </template>
          <template v-else-if="currentBillLevel === 'daily'">
            <span class="back-link" @click="backToMonthly">
              <span class="back-text">返回</span>
            </span>
            <span class="tab-title">{{ selectedMonth }} 日度账单</span>
          </template>
        </div>
        <n-select
          v-if="currentBillLevel === 'yearly'"
          class="year-select"
          v-model:value="selectedYear"
          :options="yearOptions"
          size="small"
        />
      </div>
      <n-data-table
        :columns="currentColumns"
        :data="currentBillList"
        :bordered="true"
        :loading="loading"
        :row-props="getRowProps"
        class="info-container"
      />
    </template>

    <template v-else-if="activeTab === 'recent'">
      <div class="tab-header">
        <div class="tab-title-wrapper">
          <span class="tab-title">最近30分钟的费用明细</span>
        </div>
      </div>
      <n-data-table
        :columns="recentColumns"
        :data="recentBillList"
        :bordered="true"
        :loading="loading"
        class="info-container"
      />
    </template>

    <div class="pagination-container" v-if="showPagination">
      <n-pagination
        v-model:page="queryParams.current"
        :page-count="pageCount"
        :page-sizes="[queryParams.pageSize]"
        @update:page="handlePageChange"
      />
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NDataTable, NPagination, NInput, NButton, NTabs, NTabPane, NSelect, useMessage } from 'naive-ui'
import { useStatusStore } from '@/stores/userStatus'
import { get_year_cost, get_month_cost, get_day_cost, get_recent_consumption, type BillItem, type ConsumptionBillParams } from '@/api/consumptionBill'

const { t } = useI18n()
const statusStore = useStatusStore()


// 声明window.$message类型，解决TypeScript错误
declare global {
  interface Window {
    $message: {
      error: (content: string) => void
      success: (content: string) => void
      warning: (content: string) => void
      info: (content: string) => void
    }
  }
}

// 当前激活的 tab
const activeTab = ref('yearly')

// 账单层级：年度、月度、日度
const currentBillLevel = ref('yearly')
const selectedMonth = ref('')
const selectedDay = ref('')

// 年份选择
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: `${currentYear - i}年`,
  value: currentYear - i
}))

// 查询参数
const queryParams = ref({
  apiKey: '',
  current: 1,
  pageSize: 10,
  year: selectedYear.value
})

// 账单列表数据
const yearlyBillList = ref<any[]>([])
const monthlyBillList = ref<any[]>([])
const dailyBillList = ref<any[]>([])
const recentBillList = ref<any[]>([])
const totalCount = ref(0)
const loading = ref(false)

// 根据当前层级选择不同的数据
const currentBillList = computed(() => {
  switch (currentBillLevel.value) {
    case 'yearly':
      return yearlyBillList.value
    case 'monthly':
      return monthlyBillList.value
    case 'daily':
      return dailyBillList.value
    default:
      return []
  }
})

// 计算总页数
const pageCount = computed(() => {
  return Math.ceil(totalCount.value / queryParams.value.pageSize)
})

// 显示分页控件的条件
const showPagination = computed(() => {
  return activeTab.value === 'recent' && pageCount.value > 1
})

// 年度账单表格列定义
const yearlyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'billingPeriod'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      return h(
        'span',
        {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
        [
          h('img', {
            class: 'coin-icon',
            style: {
              width: '16px',
              height: '16px',
              marginRight: '5px'
            },
            src: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp'
          }),
          row.totalAmount
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'goldCoinDeduction'
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'silverCoinDeduction'
  }
]

// 月度账单表格列定义
const monthlyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'billingPeriod'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      return h(
        'span',
        {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
        [
          h('img', {
            class: 'coin-icon',
            style: {
              width: '16px',
              height: '16px',
              marginRight: '5px'
            },
            src: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp'
          }),
          row.totalAmount
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'goldCoinDeduction'
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'silverCoinDeduction'
  }
]

// 日度账单表格列定义
const dailyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'date'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      return h(
        'span',
        {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
        [
          h('img', {
            class: 'coin-icon',
            style: {
              width: '16px',
              height: '16px',
              marginRight: '5px'
            },
            src: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp'
          }),
          row.totalAmount
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'goldCoinDeduction'
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'silverCoinDeduction'
  }
]

// 最近消费表格列定义
const recentColumns = [
  {
    title: 'Prompt ID',
    key: 'promptId'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      return h(
        'span',
        {
          style: {
            display: 'flex',
            alignItems: 'center'
          }
        },
        [
          h('img', {
            class: 'coin-icon',
            style: {
              width: '16px',
              height: '16px',
              marginRight: '5px'
            },
            src: 'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/web/p3tqfe1o62WUCbFjcOWUk9n2dlCXyCB6.webp'
          }),
          row.totalAmount
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'goldCoinDeduction'
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'silverCoinDeduction'
  }
]

// 根据当前层级选择不同的列定义
const currentColumns = computed(() => {
  switch (currentBillLevel.value) {
    case 'yearly':
      return yearlyColumns
    case 'monthly':
      return monthlyColumns
    case 'daily':
      return dailyColumns
    default:
      return []
  }
})

// 行属性 - 添加点击事件
const getRowProps = (row: any) => {
  if (currentBillLevel.value === 'yearly') {
    return {
      style: 'cursor: pointer',
      onClick: () => drillDownToMonthly(row)
    }
  }
  if (currentBillLevel.value === 'monthly') {
    return {
      style: 'cursor: pointer',
      onClick: () => drillDownToDaily(row)
    }
  }
  return {}
}

// 下钻到月度账单
const drillDownToMonthly = (row: any) => {
  selectedMonth.value = row.billingPeriod
  currentBillLevel.value = 'monthly'
  fetchMonthlyBillList(row.billingPeriod)
}

// 下钻到日度账单
const drillDownToDaily = (row: any) => {
  selectedDay.value = row.billingPeriod
  currentBillLevel.value = 'daily'
  fetchDailyBillList(row.billingPeriod)
}

// 返回年度账单
const backToYearly = () => {
  currentBillLevel.value = 'yearly'
  fetchYearlyBillList()
}

// 返回月度账单
const backToMonthly = () => {
  currentBillLevel.value = 'monthly'
  fetchMonthlyBillList(selectedMonth.value)
}

// 搜索函数
const handleSearch = () => {
  queryParams.value.current = 1
  fetchData()
}

// 页码变化处理
const handlePageChange = (page: number) => {
  queryParams.value.current = page
  fetchData()
}

// 监听 tab 变化
watch(activeTab, () => {
  queryParams.value.current = 1
  if (activeTab.value === 'yearly') {
    currentBillLevel.value = 'yearly'
  }
  fetchData()
})

// 监听年份变化
watch(selectedYear, (newYear) => {
  queryParams.value.year = newYear
  if (activeTab.value === 'yearly' && currentBillLevel.value === 'yearly') {
    fetchYearlyBillList()
  }
})

// 监听模态框显示状态变化
watch(() => statusStore.showConsumptionBillDialog, (newVal) => {
  if (newVal) {
    // 重置账单层级为年度
    currentBillLevel.value = 'yearly'
    activeTab.value = 'yearly'
    // 重置已选择的月份和日期
    selectedMonth.value = ''
    selectedDay.value = ''
    // 获取数据
    fetchData()
  }
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'yearly') {
      if (currentBillLevel.value === 'yearly') {
        await fetchYearlyBillList()
      } else if (currentBillLevel.value === 'monthly') {
        await fetchMonthlyBillList(selectedMonth.value)
      } else if (currentBillLevel.value === 'daily') {
        await fetchDailyBillList(selectedDay.value)
      }
    } else {
      await fetchRecentBillList()
    }
  } catch (error) {
    console.error('获取账单数据失败', error)
  } finally {
    loading.value = false
  }
}

// 获取年度账单列表数据
const fetchYearlyBillList = async () => {
  loading.value = true
  try {
    const params: any = {}
    
    if (queryParams.value.apiKey) {
      params.api_key = queryParams.value.apiKey
    }
    params.year = `${selectedYear.value}`
    
    const data = await get_year_cost(params)
    
    // 处理返回的数据
    if (data && data.data) {
      yearlyBillList.value = data.data.map((item: any) => ({
        billingPeriod: item.month, // 显示月份
        totalAmount: item.total_amount || 0,
        goldCoinDeduction: item.gold_coin || 0,
        silverCoinDeduction: item.silver_coin || 0
      }))
    } else {
      yearlyBillList.value = []
    }
  } catch (error) {
    console.error('获取年度账单列表失败', error)
    if (window.$message) {
      window.$message.error('获取年度账单失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 获取月度账单列表数据
const fetchMonthlyBillList = async (month: string) => {
  loading.value = true
  try {
    const params: any = {}
    
    if (queryParams.value.apiKey) {
      params.api_key = queryParams.value.apiKey
    }
    params.month = month
    
    const data = await get_month_cost(params)
    
    // 处理月度数据
    if (data && data.data) {
      monthlyBillList.value = data.data.map((item: any) => ({
        billingPeriod: item.day, // 显示日期
        totalAmount: item.total_amount || 0,
        goldCoinDeduction: item.gold_coin || 0,
        silverCoinDeduction: item.silver_coin || 0
      }))
    } else {
      monthlyBillList.value = []
    }
  } catch (error) {
    console.error('获取月度账单列表失败', error)
    if (window.$message) {
      window.$message.error('获取月度账单失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 获取日度账单列表数据
const fetchDailyBillList = async (day: string) => {
  loading.value = true
  try {
    const params: any = {}
    
    if (queryParams.value.apiKey) {
      params.api_key = queryParams.value.apiKey
    }
    params.day = day
    
    const data = await get_day_cost(params)
    
    // 处理日度数据
    if (data && data.data) {
      dailyBillList.value = data.data.map((item: any) => ({
        date: item.hour || item.time || '', // 显示小时或时间
        totalAmount: item.total_amount || 0,
        goldCoinDeduction: item.gold_coin || 0,
        silverCoinDeduction: item.silver_coin || 0
      }))
    } else {
      dailyBillList.value = []
    }
  } catch (error) {
    console.error('获取日度账单列表失败', error)
    if (window.$message) {
      window.$message.error('获取日度账单失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 获取最近消费列表数据
const fetchRecentBillList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: queryParams.value.current,
      page_size: queryParams.value.pageSize
    }
    
    if (queryParams.value.apiKey) {
      params.api_key = queryParams.value.apiKey
    }
    
    // 使用专门的最近消费接口
    const data = await get_recent_consumption(params)
    
    // 处理最近消费数据
    if (data && data.data) {
      // 假设数据结构包含 list 和 total
      const list = data.data.list || data.data
      
      recentBillList.value = Array.isArray(list) ? list.map((item: any) => ({
        promptId: item.prompt_id || '',
        totalAmount: item.total_amount || 0,
        goldCoinDeduction: item.gold_coin || 0,
        silverCoinDeduction: item.silver_coin || 0
      })) : []
      
      // 设置总数
      totalCount.value = data.data.total || data.total || recentBillList.value.length
    } else {
      recentBillList.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取最近消费列表失败', error)
    if (window.$message) {
      window.$message.error('获取最近消费列表失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.condition-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  width: 100%;

  span {
    white-space: nowrap;
  }

  .filter-input {
    flex: 1;
    max-width: 400px;
  }

  .search-btn {
    margin-left: 8px;
    min-width: 80px;
  }
}

.tabs-container {
  display: flex;
  margin: 16px 0;
  padding: 2px;
  border-radius: 4px;
  background-color: #1E293B;
  width: fit-content;
  
  .tab-item {
    padding: 6px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    border-radius: 4px;
    color: #94A3B8;
    
    &.active {
      background-color: #334155;
      color: #FFF;
    }
    
    &:hover:not(.active) {
      color: #FFF;
    }
  }
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .tab-title-wrapper {
    display: flex;
    align-items: center;
    
    .back-link {
      cursor: pointer;
      margin-right: 10px;
      display: flex;
      align-items: center;
      
      &:hover {
        opacity: 0.7;
      }
      
      .back-text {
        font-size: 14px;
        color: #64748B;
      }
    }
    
    .tab-title {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .year-select {
    width: 120px;
  }
}

.info-container {
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.copy-icon, .coin-icon {
  cursor: pointer;
}
</style>
