<template>
  <v-theme>
    <n-modal
      v-model:show="datasetStore.showTasksDialog"
      size="huge"
      :bordered="false"
      :auto-focus="false"
      :close-on-esc="false"
      :mask-closable="false"
      :on-after-leave="onDialogClose"
    >
      <n-card 
        closable 
        class="custom-scrollbar"
        title="Task List"
        header-style="padding: 20px"
        footer-style="padding: 0"
        style="max-width: 60vw;max-height: 82vh;"
        content-style="padding: 0;"
        :auto-focus="false"
        @close="onDialogClose">
        <div class="card-content">
          <div class="task-header">
            <div class="date-picker black">
              <n-date-picker
                v-model:value="pickerTime"
                type="daterange"
                clearable
                :is-date-disabled="disableDate"
                @update:value="handleDateChange"
              />
            </div>
            <div class="select">
              <span class="black">
                <n-select v-model:value="filter" :options="filterOptions" :consistent-menu-width="false" />
              </span>
              <span class="black">
                <n-select v-model:value="filter" :options="filterOptions" :consistent-menu-width="false" />
              </span>
            </div>
          </div>
          <div class="task-list-box custom-scrollbar">
            <ul class="task-list">
              <li v-for="index in 10" :key="index">
                <div class="image" @click="showDetail">
                  <vDefaultPic />
                </div>
                <div class="task-info">
                  <div class="task-info-item">
                    <span class="name">202306151000-121212000</span>
                    <span class="tag">Finetune</span>
                  </div>
                  <div class="task-info-item">
                    <span class="status">Quened</span>
                    <span class="step">2000/2000 step</span>
                  </div>
                  <div class="task-info-item">
                    <n-progress
                      type="line"
                      :percentage="60"
                      :show-indicator="false"
                      processing
                      :height="12"
                      color="#FFF"
                    />
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="pagination">
            <n-pagination 
                v-model:page="datasetStore.current" 
                :page-count="2" 
                :on-update:page="pageChange" />
          </div>
        </div>
      </n-card>
    </n-modal>
  </v-theme>
</template>
<script setup lang="ts">
import { NModal, NCard, NDatePicker, NSelect, NProgress, NPagination } from 'naive-ui'
import vTheme from '@/components/modules/vTheme.vue'
import vDefaultPic from '@/components/modules/vDefaultPic.vue'
import { useDatasetStore } from '@/stores/datasetStore'
import { ref } from 'vue'
const datasetStore = useDatasetStore()
const pickerTime = ref<[number, number]>([new Date().getTime(), new Date().getTime()])

const filter = ref('All')
const filterOptions = ref([{
          label: 'All',
          value: 'All'
        },{
          label: 'Training',
          value: 'Training'
        },{
          label: 'Annotation',
          value: 'Annotation'
        },])

const onDialogClose = () => {
  datasetStore.setTasksDialog(false)
}


// 禁用今天之后的日期
const disableDate = (timestamp: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 将时间设置为今天的 00:00:00
  return timestamp > today.getTime()
}

// 限制时间区间不超过 30 天
const handleDateChange = (value: string | any[]) => {
  if (value && value.length === 2) {
    const [start, end] = value
    const diffInDays = (end - start) / (1000 * 60 * 60 * 24)

    if (diffInDays > 30) {
      alert('The time range should not exceed 30 days')
      pickerTime.value = [start, start + 30 * 24 * 60 * 60 * 1000] // 自动调整为 30 天
    }
  }
}

const pageChange = (page: number) => {
  console.log(page)
}

const showDetail = () => {
  console.log('showDetail')
}
</script>
<style scoped lang="less">
.card-content{
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(82vh - 100px);
  padding-left: 16px;
}
.task-header{
  display: flex;
  padding-right: 16px;
  justify-content: space-between;

  .date-picker{
    width: 30%;
    min-width: 160px;
  }
  .black{
    background: #000;
  }
  .select{
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

}
.task-list-box{
  flex: 1;
  overflow-y: auto;
  padding-right: 16px;
}
.task-list{
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  li{
    display: flex;
    gap: 16px;
    padding: 12px 0;
    width: 100%;
    .image{
      display: flex;
      gap: 12px;
      width: 82px;
      height: 82px;
      background: #000;
    }
    .task-info{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
      flex: 1;
    }
    .task-info-item{
      display: flex;
      justify-content: space-between;
    }
    .name{
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tag{
      font-size: 14px;
      color: #FFF;
      background: #001AFF99;
      padding: 2px 8px;
      border-radius: 20px;
    }
    .status{
      font-size: 14px;
      color: #FFF;
      background: #EAB30899;
      padding: 2px 8px;
      border-radius: 20px;
    }
  }
}
.pagination{
  display: flex;
  justify-content: center;
  padding: 20px 0 20px 0;
  box-shadow: 0px -10px 10px rgba(0, 0, 0, 0.1);
  margin-left: -16px;
}
</style>
