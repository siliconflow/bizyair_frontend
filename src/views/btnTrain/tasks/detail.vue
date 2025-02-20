<script setup lang="ts">
import { NModal, NCard, NProgress, NButton } from 'naive-ui'
import vDefaultPic from '@/components/modules/vDefaultPic.vue'
import { useDatasetStore } from '@/stores/datasetStore'
import vTooltips  from '@/components/modules/v-tooltip.vue'
// import { ref } from 'vue'
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
          <div>
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
            <div class="tag-status">
              <span class="tag">Finetune</span>
              <span class="status">Failed</span>
            </div>
          </div>

          <div>
            <p class="base-model">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-3.775 0-6.387-1.162T3 17V7q0-1.65 2.638-2.825T12 3t6.363 1.175T21 7v10q0 1.675-2.613 2.838T12 21m0-11.975q2.225 0 4.475-.638T19 7.025q-.275-.725-2.512-1.375T12 5q-2.275 0-4.462.638T5 7.025q.35.75 2.538 1.375T12 9.025M12 14q1.05 0 2.025-.1t1.863-.288t1.675-.462T19 12.525v-3q-.65.35-1.437.625t-1.675.463t-1.863.287T12 11t-2.05-.1t-1.888-.288T6.4 10.15T5 9.525v3q.625.35 1.4.625t1.663.463t1.887.287T12 14m0 5q1.15 0 2.338-.175t2.187-.462t1.675-.65t.8-.738v-2.45q-.65.35-1.437.625t-1.675.463t-1.863.287T12 16t-2.05-.1t-1.888-.288T6.4 15.15T5 14.525V17q.125.375.788.725t1.662.638t2.2.462T12 19"/></svg>
              Base Model: <span>F.1_dev-fp8</span>
            </p>
            <div class="task-info-item">
              <div>
                <p class="has-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></g></svg>
                  Epochs: 3
                </p>
                <p class="has-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M8.697.04a.5.5 0 0 1 .296.542L8.09 6h4.41a.5.5 0 0 1 .4.8l-6 8a.5.5 0 0 1-.893-.382L6.91 9H2.5a.5.5 0 0 1-.4-.8l6-8a.5.5 0 0 1 .597-.16M3.5 8h4a.5.5 0 0 1 .493.582L7.33 12.56L11.5 7h-4a.5.5 0 0 1-.493-.582L7.67 2.44z" clip-rule="evenodd"/></svg>
                  Mixed Precision: fp16
                </p>
              </div>
              <div>
                <p class="has-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m17 3l4 3l-4 3"/><path d="M3 12v-2a4 4 0 0 1 4-4h14M7 21l-4-3l4-3"/><path d="M21 12v2a4 4 0 0 1-4 4H3"/></g></svg>
                  Training lterations: 5
                </p>
                <p class="has-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 6.6H3m18 10.8H3M6.6 3v18M17.4 3v18"/></svg>
                  Batch Size: 32
                </p>
              </div>
            </div>
          </div>


          <div class="">
            <div class="task-info-item">
              <p>Progress</p>
              <p>2000/2000 steps</p>
            </div>
            <n-progress
              type="line"
              :percentage="60"
              :show-indicator="false"
              processing
              :height="12"
              color="#FFF"
            />
            <p>
              Task ended on: <span>2025-01-20 14:47:30</span>
            </p>
          </div>

          <div class="task-info-item">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></g></svg>
              Training Workflow
            </p>
            <n-button color="#F43F5E99">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.521 2.624a2 2 0 0 1 2.958 0l1.02 1.12a2 2 0 0 0 1.572.651l1.513-.07a2 2 0 0 1 2.092 2.09l-.071 1.514a2 2 0 0 0 .651 1.572l1.12 1.02a2 2 0 0 1 0 2.958l-1.12 1.02a2 2 0 0 0-.651 1.572l.07 1.513a2 2 0 0 1-2.09 2.092l-1.514-.071a2 2 0 0 0-1.572.651l-1.02 1.12a2 2 0 0 1-2.958 0l-1.02-1.12a2 2 0 0 0-1.572-.651l-1.513.07a2 2 0 0 1-2.092-2.09l.071-1.514a2 2 0 0 0-.651-1.572l-1.12-1.02a2 2 0 0 1 0-2.958l1.12-1.02a2 2 0 0 0 .651-1.572l-.07-1.513a2 2 0 0 1 2.09-2.092l1.514.071a2 2 0 0 0 1.572-.651z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12l2 2l4-4"/></g></svg>
              </template>
              Load
            </n-button>
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
  p{
    padding: 0;
    margin: 0;
  }
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
        font-size: 16px;
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
    .tag-status{
      display: flex;
      gap: 6px;
      .tag{
        background-color: #7C3AED;
        color: #fff;
        padding: 2px 10px;
        border-radius: 20px;
      }
      .status{
        background-color: #F43F5E99;
        color: #fff;
        padding: 2px 10px;
        border-radius: 20px;
      }
    }
    .base-model{
      display: flex;
      gap: 4px;
      span{
        color: #00D0FF;
      }
    }
  }
  .has-icon{
    display: flex;
    gap: 6px;
    align-items: center;
  }
}
</style>
