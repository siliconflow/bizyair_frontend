<script setup lang="ts">
import { NModal, NCard, NProgress } from 'naive-ui'
import vDefaultPic from '@/components/modules/vDefaultPic.vue'
import { useDatasetStore } from '@/stores/datasetStore'
import vTooltips  from '@/components/modules/v-tooltip.vue'
import { ref } from 'vue'
const datasetStore = useDatasetStore()


const onDialogClose = () => {
  datasetStore.setTasksDetailDialog(false)
}
</script>
<template>
  <n-modal
    v-model:show="datasetStore.showTasksDetailDialog"
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
      title="Task Details"
      header-style="padding: 20px"
      footer-style="padding: 0"
      style="max-width: 80vw; max-height: 82vh; overflow-y: auto;"
      content-style="padding: 0;"
      content-class="custom-scrollbar"
      :auto-focus="false"
      @close="onDialogClose">
      <div class="detail">
        <div class="image">
          <vDefaultPic />
        </div>
        <div class="task-info">
          <div class="task-info-item">
            <span class="name">202306151000-121212000</span>
            <span class="handle">
              <vTooltips tips="Stop">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m0 14.5a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13M5 5h6v6H5z"/></svg>
              </vTooltips>
              <vTooltips tips="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"/></svg>
              </vTooltips>
            </span>
          </div>
          <div>
            <span class="tag">Finetune</span>
            <span class="status">Failed</span>
          </div>
          <p>
            Base Model: <span>F.1_dev-fp8</span>
          </p>
          <div class="task-info-item">
            
          </div>
          <div class="task-info-item">
            <n-progress
              type="line"
              :percentage="60"
              :stroke-width="20"
              :show-text="false"
              :stroke-linecap="'round'"
            />
          </div>
        </div>
      </div>
      <div class="resource">

      </div>
    </n-card>
  </n-modal>
</template>
<style scoped lang="less">
.detail{
  display: flex;
  gap: 24px;
  padding: 0 24px;
  .image{
    width: 270px;
    height: 270px;
    background-color: #000;
  }
  .task-info{
    flex: 1;
    
    .task-info-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .name{
        font-size: 20px;
        font-weight: 500;
      }
      .handle{
        display: flex;
        gap: 10px;
        svg{
          cursor: pointer;
        }
      }
    }
  }
}
</style>
