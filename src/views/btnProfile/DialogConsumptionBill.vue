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

    <n-tabs
      class="filter-tab"
      type="segment"
      animated
      v-model:value="activeTab"
    >
      <n-tab name="yearly">{{ $t('btnProfile.consumptionBill.yearlyBill') }}</n-tab>
      <n-tab name="recent">{{ $t('btnProfile.consumptionBill.recentConsumption') }}</n-tab>
    </n-tabs>

    <template v-if="activeTab === 'yearly'">
      <div class="tab-header">
        <div class="tab-title-wrapper">
          <n-breadcrumb>
            <n-breadcrumb-item @click="backToYearly">
              {{ $t('btnProfile.consumptionBill.yearlyBill') }}
            </n-breadcrumb-item>
            <n-breadcrumb-item v-if="currentBillLevel === 'monthly' || currentBillLevel === 'daily'" @click="backToMonthly">
              {{ selectedMonth }} {{ $t('btnProfile.consumptionBill.monthlyBill') }}
            </n-breadcrumb-item>
            <n-breadcrumb-item v-if="currentBillLevel === 'daily'" @click="backToDaily">
              {{ selectedDay }} {{ $t('btnProfile.consumptionBill.dailyBill') }}
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        <div class="header-right">
          <n-select
            v-if="currentBillLevel === 'yearly'"
            class="year-select"
            v-model:value="selectedYear"
            :options="yearOptions"
            size="small"
          />
          <n-popover trigger="click" placement="bottom-end">
            <template #trigger>
              <n-button size="small" type="primary" ghost>
                选择API Key
              </n-button>
            </template>
            <div class="api-key-popover">
              <n-input
                v-model:value="queryParams.apiKey"
                class="filter-input"
                :placeholder="$t('btnProfile.consumptionBill.enterApiKey')"
                @keydown.enter="handleSearch"
              />
              <n-button type="primary" size="small" @click="handleSearch">
                {{ $t('btnProfile.consumptionBill.search') }}
              </n-button>
            </div>
          </n-popover>
        </div>
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

    <template v-if="activeTab === 'recent'">
      <div class="tab-header">
        <div class="tab-title-wrapper">
          <span class="tab-title">{{ $t('btnProfile.consumptionBill.recentBillDetails') }}</span>
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
import { NModal, NDataTable, NPagination, NInput, NButton, NSelect, NTooltip, NPopover, NBreadcrumb, NBreadcrumbItem, NTabs, NTab } from 'naive-ui'
import { useStatusStore } from '@/stores/userStatus'
import { get_year_cost, get_month_cost, get_day_cost, get_recent_consumption } from '@/api/consumptionBill'
import { formatCoinAmount } from '@/utils/tool'

const { t } = useI18n()
const statusStore = useStatusStore()

const activeTab = ref('yearly')

// 账单层级
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
const yearlyBillList = ref<any[]>([])
const monthlyBillList = ref<any[]>([])
const dailyBillList = ref<any[]>([])
const recentBillList = ref<any[]>([])
const totalCount = ref(0)
const loading = ref(false)
// 选择不同的数据
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
const pageCount = computed(() => {
  return Math.ceil(totalCount.value / queryParams.value.pageSize)
})
const showPagination = computed(() => {
  return activeTab.value === 'recent' && pageCount.value > 1
})
// 年度账单
const yearlyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'time'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      const total = (row.charge_amount || 0) + (row.gift_amount || 0);
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
          h(
            NTooltip,
            { trigger: 'hover', placement: 'top' },
            {
              default: () => `${total}`,
              trigger: () => formatCoinAmount(total)
            }
          )
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'charge_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.charge_amount || 0}`,
          trigger: () => formatCoinAmount(row.charge_amount || 0)
        }
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'gift_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.gift_amount || 0}`,
          trigger: () => formatCoinAmount(row.gift_amount || 0)
        }
      )
    }
  }
]

// 月度账单
const monthlyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'time'
  },    
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      const total = (row.charge_amount || 0) + (row.gift_amount || 0);
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
          h(
            NTooltip,
            { trigger: 'hover', placement: 'top' },
            {
              default: () => `${total}`,
              trigger: () => formatCoinAmount(total)
            }
          )
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'charge_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.charge_amount || 0}`,
          trigger: () => formatCoinAmount(row.charge_amount || 0)
        }
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'gift_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.gift_amount || 0}`,
          trigger: () => formatCoinAmount(row.gift_amount || 0)
        }
      )
    }
  }
]

// 日度账单
const dailyColumns = [
  {
    title: t('btnProfile.consumptionBill.billingPeriod'),
    key: 'time'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      const total = (row.charge_amount || 0) + (row.gift_amount || 0);
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
          h(
            NTooltip,
            { trigger: 'hover', placement: 'top' },
            {
              default: () => `${total}`,
              trigger: () => formatCoinAmount(total)
            }
          )
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'charge_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.charge_amount || 0}`,
          trigger: () => formatCoinAmount(row.charge_amount || 0)
        }
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'gift_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.gift_amount || 0}`,
          trigger: () => formatCoinAmount(row.gift_amount || 0)
        }
      )
    }
  }
]
// 最近消费
const recentColumns = [
  {
    title: 'Prompt ID',
    key: 'prompt_id'
  },
  {
    title: t('btnProfile.consumptionBill.totalAmount'),
    key: 'totalAmount',
    render(row: any) {
      const total = (row.charge_amount || 0) + (row.gift_amount || 0);
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
          h(
            NTooltip,
            { trigger: 'hover', placement: 'top' },
            {
              default: () => `${total}`,
              trigger: () => formatCoinAmount(total)
            }
          )
        ]
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.goldCoinDeduction'),
    key: 'charge_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.charge_amount || 0}`,
          trigger: () => formatCoinAmount(row.charge_amount || 0)
        }
      )
    }
  },
  {
    title: t('btnProfile.consumptionBill.silverCoinDeduction'),
    key: 'gift_amount',
    render(row: any) {
      return h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          default: () => `${row.gift_amount || 0}`,
          trigger: () => formatCoinAmount(row.gift_amount || 0)
        }
      )
    }
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

const fetchData = async () => {
  loading.value = true
  
  if (activeTab.value === 'yearly') {
    await fetchBillByLevel(currentBillLevel.value)
  } else {
    await fetchRecentBillList()
  }
  
  loading.value = false
}

// 根据层级获取账单数据
const fetchBillByLevel = async (level: string, timeParam?: string) => {
  const params: any = {}

  if (queryParams.value.apiKey) {
    params.api_key = queryParams.value.apiKey
  }
  
  let data: any
  
  switch (level) {
    case 'yearly':
      params.year = `${selectedYear.value}`
      data = await get_year_cost(params)
      //把这个数据乘100倍
    //   data.data.by_time_results.forEach((item: any) => {
    //     item.charge_amount = item.charge_amount * 10
    //     item.gift_amount = item.gift_amount * 10
    //   })

      if (data && data.data) {
        yearlyBillList.value = formatBillData(data.data.by_time_results)
      } else {
        yearlyBillList.value = []
      }
      break
      
    case 'monthly':
      params.month = timeParam || selectedMonth.value
      data = await get_month_cost(params)
      
      //把这个数据乘100倍
    //   data.data.by_time_results.forEach((item: any) => {
    //     item.charge_amount = item.charge_amount * 1000
    //     item.gift_amount = item.gift_amount * 1000
    //   })

      if (data && data.data) {
        monthlyBillList.value = formatBillData(data.data.by_time_results, 'day')
      } else {
        monthlyBillList.value = []
      }
      break
      
    case 'daily':
      params.day = timeParam || selectedDay.value
      data = await get_day_cost(params)
      
      if (data && data.data) {
        dailyBillList.value = formatBillData(data.data.by_time_results, 'hour')
      } else {
        dailyBillList.value = []
      }
      break
  }
}

const formatBillData = (data: any[], timeField?: string) => {
  return data.map((item: any) => ({
    time: item.time || (timeField && item[timeField]) || '',
    charge_amount: item.charge_amount || 0,
    gift_amount: item.gift_amount || 0,
    prompt_id: item.prompt_id || ''
  }))
}

const drillDownToMonthly = (row: any) => {
  selectedMonth.value = row.time
  currentBillLevel.value = 'monthly'
  fetchBillByLevel('monthly', row.time)
}

const drillDownToDaily = (row: any) => {
  selectedDay.value = row.time
  currentBillLevel.value = 'daily'
  fetchBillByLevel('daily', row.time)
}

const backToYearly = () => {
  currentBillLevel.value = 'yearly'
  fetchBillByLevel('yearly')
}

const backToMonthly = () => {
  currentBillLevel.value = 'monthly'
  fetchBillByLevel('monthly')
}

const backToDaily = () => {
  currentBillLevel.value = 'daily'
  fetchBillByLevel('daily')
}

const handleSearch = () => {
  queryParams.value.current = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.value.current = page
  fetchData()
}

watch(activeTab, () => {
  queryParams.value.current = 1
  if (activeTab.value === 'yearly') {
    currentBillLevel.value = 'yearly'
  }
  fetchData()
})

watch(selectedYear, (newYear) => {
  queryParams.value.year = newYear
  if (activeTab.value === 'yearly' && currentBillLevel.value === 'yearly') {
    fetchBillByLevel('yearly')
  }
})

watch(() => statusStore.showConsumptionBillDialog, (newVal) => {
  if (newVal) {
    currentBillLevel.value = 'yearly'
    activeTab.value = 'yearly'
    // 重置已选择的月份和日期
    selectedMonth.value = ''
    selectedDay.value = ''
    fetchData()
  }
})

// 获取最近消费列表数据
const fetchRecentBillList = async () => {
  loading.value = true
  
  const params: any = {}
  if (queryParams.value.apiKey) {
    params.api_key = queryParams.value.apiKey
  }
  const data = await get_recent_consumption(params)
  if (data && data.data && data.data.prompt_results) {
    const promptResults = data.data.prompt_results || []
    const allRecords = promptResults.map((item: any) => ({
      prompt_id: item.prompt_id || '',
      charge_amount: item.charge_amount || 0,
      gift_amount: item.gift_amount || 0
    }))
    //最多显示100条
    totalCount.value = allRecords.length > 100 ? 100 : allRecords.length
    // 前端分页
    const startIndex = (queryParams.value.current - 1) * queryParams.value.pageSize
    const endIndex = Math.min(startIndex + queryParams.value.pageSize, totalCount.value)
    recentBillList.value = allRecords.slice(startIndex, endIndex)
  } else {
    recentBillList.value = []
    totalCount.value = 0
  }
  
  loading.value = false
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.filter-tab {
  width: 240px;
  margin-bottom: 16px;

  :deep(.n-tabs-rail) {
    // background-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.2);
  }

  .coin-icon {
    width: 16px;
    height: 16px;
    margin-left: 4px;
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
    
    :deep(.n-breadcrumb) {
      font-size: 14px;
      
      .n-breadcrumb-item {
        cursor: pointer;
        
        &:hover {
          color: #18A058;
        }
        
        &.n-breadcrumb-item--link {
          color: #18A058;
        }

        &:last-child {
          color: #94A3B8;
          cursor: default;
          
          &:hover {
            color: #94A3B8;
          }
        }
      }
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

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-popover {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #1E293B;
  border-radius: 4px;
  width: 300px;

  .filter-input {
    flex: 1;
    margin-right: 8px;
  }

  .n-button {
    flex-shrink: 0;
  }
}

:deep(.n-tabs .n-tabs-rail .n-tabs-capsule) {
//   background-color: rgba(255, 255, 255, 0.2);
}
</style>
