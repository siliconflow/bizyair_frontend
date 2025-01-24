<template>
  <n-modal
    v-model:show="datasetStore.showListDialog"
    size="huge"
    :bordered="false"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
    :on-after-leave="onDialogClose"
    display-directive="show"
  >
    <n-card 
      closable 
      class="custom-scrollbar"
      title="Datasets"
      header-style="padding: 20px"
      footer-style="padding: 0"
      style="max-width: 90vw;max-height: 82vh;"
      content-style="padding: 0 16px;"
      :auto-focus="false"
      @close="onDialogClose">
      <div class="dataset-box">
        
        <div class="header">
          <div class="search">
            <n-input placeholder="Search">
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m18.031 16.617l4.283 4.282l-1.415 1.415l-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9s9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617m-2.006-.742A6.98 6.98 0 0 0 18 11c0-3.867-3.133-7-7-7s-7 3.133-7 7s3.133 7 7 7a6.98 6.98 0 0 0 4.875-1.975z"/></svg>
              </template>
            </n-input>
            <n-popover trigger="hover" placement="bottom">
              <template #trigger>
                <svg class="filter" width="16" height="16" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6666 1H1.33325L6.66658 7.30667V11.6667L9.33325 13V7.30667L14.6666 1Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </template>
            <span class="handle-item">rename</span>
            <span class="handle-item">Delete</span>
          </n-popover>
          </div>
          <n-button type="primary">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><path fill="currentColor" d="M11.5 20v-7.5H4v-1h7.5V4h1v7.5H20v1h-7.5V20z"/></svg>
            </template>
            New Dataset
          </n-button>
        </div>
        <ul class="dataset-list custom-scrollbar">
          <li v-for="(e, i) in tableData" :key="i">
            <div class="dataset-item">

              <datasetImage :src="e.versions[0]?.cover_urls && e.versions[0]?.cover_urls[0]" />
              <div class="dataset-info">
                <span class="judge-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M9.52 3a2 2 0 0 1 1.442.614l.12.137L12.48 5.5H20a2 2 0 0 1 1.995 1.85L22 7.5V19a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V5a2 2 0 0 1 1.85-1.995L4 3zm0 2H4v14h16V7.5h-7.52a2 2 0 0 1-1.442-.614l-.12-.137zm4.955 5.232a1 1 0 0 1 1.497 1.32l-.083.095l-4.172 4.172a1.1 1.1 0 0 1-1.46.085l-.095-.085l-2.051-2.051a1 1 0 0 1 1.32-1.498l.094.084l1.414 1.414z"/></g></svg>
                </span>
                <div class="word">
                  <p class="name">{{ e.name }}</p>
                  <!-- <p class="hint">1000 images</p> -->
                </div>
                <span class="add-node"></span>
                <n-popover trigger="hover" placement="bottom">
                  <template #trigger>
                    <span class="handle"><svg data-v-60d944c6="" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none" class="cursor-pointer"><path data-v-60d944c6="" d="M8.66659 7.99992C8.66659 7.63173 8.36811 7.33325 7.99992 7.33325C7.63173 7.33325 7.33325 7.63173 7.33325 7.99992C7.33325 8.36811 7.63173 8.66659 7.99992 8.66659C8.36811 8.66659 8.66659 8.36811 8.66659 7.99992Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path><path data-v-60d944c6="" d="M8.66659 3.33325C8.66659 2.96506 8.36811 2.66658 7.99992 2.66658C7.63173 2.66658 7.33325 2.96506 7.33325 3.33325C7.33325 3.70144 7.63173 3.99992 7.99992 3.99992C8.36811 3.99992 8.66659 3.70144 8.66659 3.33325Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path><path data-v-60d944c6="" d="M8.66659 12.6666C8.66659 12.2984 8.36811 11.9999 7.99992 11.9999C7.63173 11.9999 7.33325 12.2984 7.33325 12.6666C7.33325 13.0348 7.63173 13.3333 7.99992 13.3333C8.36811 13.3333 8.66659 13.0348 8.66659 12.6666Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                  </template>
                  <span class="handle-item">rename</span>
                  <span class="handle-item" @click="del(e.id)">Delete</span>
                </n-popover>
                
              </div>
            </div>
          </li>
        </ul>
        <div class="pagination">
          <n-pagination 
            v-if="pageCount"
            v-model:page="current" 
            :page-count="4" 
            :on-update:page="pageChange" />
        </div>
      </div>
    </n-card>
  </n-modal>
</template>
<script setup lang="ts">
import { useDatesetStore } from '@/stores/datasetStore'
import { NModal, NCard, NInput, NButton, NPopover, NPagination } from 'naive-ui'
import { del_datasets, get_datasets } from '@/api/dataset'
import datasetImage from './datasetImage.vue'
import { onMounted, ref } from 'vue'
import { useConfirm } from '@/components/modules/vConfirm/index'


const datasetStore = useDatesetStore()
const tableData = ref<{name: string, id: number, versions: any}[]>([])
const current = ref(1)
const pageCount = ref(0)
const pageSize = ref(20)

const onDialogClose = () => {
  datasetStore.setListDialog(false)
}
const getData = async () => {
  const res = await get_datasets({
    current: current.value,
    page_size: pageSize.value
  }, {
    keyword: ''
  })
  pageSize.value = res.data.total/pageSize.value > 1 ? 0 : Math.ceil(res.data.total/pageSize.value)
  tableData.value = res.data.list
  console.log(res)
}

const del = async (id: number) => {
  const res = await useConfirm({
    title: 'Are you sure you want to delete it?',
    content: 'This action cannot be undone.',
    cancelText: 'No, Keep It',
    continueText: 'Yes, Delete It',
  })
  if (!res) return
  await del_datasets({ id })
  getData()
}
const pageChange = (page: number) => {
  current.value = page
  console.log(page)
  getData()
}

onMounted(() => {
  getData()
})
</script>
<style scoped lang="less">
.dataset-box{
  height: calc(82vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.header{
  display: flex;
  justify-content: space-between;
  height: 36px;
  .search{
    width: 320px;
    display: flex;
    align-items: center;
    .filter{
      margin-left: 12px;
      cursor: pointer;
    }
  }
}
.dataset-list{
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
  padding: 0;
  margin: 0;
  margin: 0 -10px;
  overflow-y: auto;
  flex: 1;
  li{
    width: (1/10)*100%;
    // min-width: 300px;
    box-sizing: border-box;
    padding: 10px;
    list-style: none;
    position: relative;
    .dataset-item{
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      width: 100%;
      border-radius: 0.5rem;
      background-color: rgba(0, 0, 0, 0.4);
      // border: 1px solid #ddd;
      height: 260px;
    }
    button{
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
  &::after{
    content: '';
    display: block;
  }
}
.dataset-info{
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: all .3s;
  .judge-icon{
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: rgba(37, 37, 37, 0.4);
    // background-color: red;
    left: 10px;
    top: 10px;
    svg{
      display: block;
      margin: 3px auto;
    }
  }
  .word{
    position: absolute;
    left: 0;
    bottom: 0;
    height: 50px;
    color: #FFF;
    width: 100%;
    // box-sizing: border-box;
    transition: all .3s;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, .8));;
    padding: 20px 16px 10px 16px;
    border-radius: 0 0 0.5rem 0.5rem;
    p{
      line-height: 20px;
      padding: 0;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
  }
  .name{
    font-weight: bold;
  }
  .add-node{
    width: 60px;
    height: 60px;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-width='4'%3E%3Cpath stroke-linejoin='round' d='M15 26V15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15V26'/%3E%3Cpath stroke-linejoin='round' d='M39 25V31.5C39 37.8513 33.8513 43 27.5 43H26.5C20.1487 43 15 37.8513 15 31.5V25'/%3E%3Cpath stroke-linejoin='round' d='M21 29V27.1058V24C21 22.3431 22.3431 21 24 21C25.6569 21 27 22.3431 27 24V27.1818V29'/%3E%3Cpath stroke-linejoin='round' d='M27 29V27.1058V24C27 22.3431 28.3431 21 30 21C31.6569 21 33 22.3431 33 24V27.1818V29'/%3E%3Cpath stroke-linejoin='round' d='M33 29V27.1058V24C33 22.3431 34.3431 21 36 21C37.6569 21 39 22.3431 39 24V27.1818V29'/%3E%3Cpath d='M28 15C28 13.9489 27.8378 12.9357 27.5371 11.9839C27.2008 10.9195 26.6913 9.93208 26.0415 9.0547C24.2198 6.59472 21.2961 5 18 5C14.7039 5 11.7802 6.59472 9.95847 9.0547C9.30873 9.93208 8.79916 10.9195 8.46286 11.9839C8.16217 12.9357 8 13.9489 8 15'/%3E%3C/g%3E%3C/svg%3E");
    mask-size: 100% 100%;
    background-color: #7C3AED;
    cursor: pointer;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all .3s;
    opacity: 0;
  }
  .handle{
    position: absolute;
    right: 6px;
    top: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  &:hover{
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 0.5rem;
    .word{
      background: rgba(0, 0, 0, 0);
    }
    .add-node{
      opacity: 1;
    }
  }
}
.handle-item{
  display: block;
  cursor: pointer;
}
.pagination{
  display: flex;
  justify-content: center;
  padding: 20px 0;
  box-shadow: 0px -10px 10px rgba(0, 0, 0, 0.1);
  margin: 0 -16px;
}


@media screen and (max-width: 4480px) {
  .dataset-box .dataset-list li{
    width: (1/13) * 100%;
  }
}

@media screen and (max-width: 4120px) {
  .dataset-box .dataset-list li{
    width: (1/12) * 100%;
  }
}

@media screen and (max-width: 3760px) {
  .dataset-box .dataset-list li{
    width: (1/11) * 100%;
  }
}

@media screen and (max-width: 3400px) {
  .dataset-box .dataset-list li{
    width: (1/10) * 100%;
  }
}

@media screen and (max-width: 3040px) {
  .dataset-box .dataset-list li{
    width: (1/9) * 100%;
  }
}

@media screen and (max-width: 2680px) {
  .dataset-box .dataset-list li{
    width: (1/8) * 100%;
  }
}

@media screen and (max-width: 2320px) {
  .dataset-box .dataset-list li{
    width: (1/7) * 100%;
  }
}

@media screen and (max-width: 1960px) {
  .dataset-box .dataset-list li{
    width: (1/6) * 100%;
  }
}

@media screen and (max-width: 1600px) {
  .dataset-box .dataset-list li{
    width: (1/5) * 100%;
  }
}

@media screen and (max-width: 1366px) {
  .dataset-box .dataset-list li{
    width: (1/4) * 100%;
  }
}

@media screen and (max-width: 1024px){
  .dataset-box .dataset-list li{
    width: (1/3) * 100%;
  }
}
@media screen and (max-width: 768px){
  .dataset-box .dataset-list li{
    width: (1/2) * 100%;
  }
}
</style>
