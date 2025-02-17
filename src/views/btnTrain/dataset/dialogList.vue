<template>
  <div>
    <n-modal
      v-model:show="datasetStore.showListDialog"
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
              <n-input placeholder="Search" v-model:value="datasetStore.keyword" v-debounce="datasetStore.getDatasetList">
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m18.031 16.617l4.283 4.282l-1.415 1.415l-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9s9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617m-2.006-.742A6.98 6.98 0 0 0 18 11c0-3.867-3.133-7-7-7s-7 3.133-7 7s3.133 7 7 7a6.98 6.98 0 0 0 4.875-1.975z"/></svg>
                </template>
              </n-input>
              <!-- <n-popover trigger="hover" placement="bottom">
                <template #trigger>
                  <svg class="filter" width="16" height="16" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6666 1H1.33325L6.66658 7.30667V11.6667L9.33325 13V7.30667L14.6666 1Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </template>
                <vRadio :data="fileterData"></vRadio>
              </n-popover> -->
            </div>
            <n-button type="primary" @click="toUpload">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><path fill="currentColor" d="M11.5 20v-7.5H4v-1h7.5V4h1v7.5H20v1h-7.5V20z"/></svg>
              </template>
              New Dataset
            </n-button>
          </div>
          <div class="dataset-list-box custom-scrollbar">
            {{ test }}
            <ul class="dataset-list">
              <li v-for="(e, i) in datasetStore.tableData" :key="i">
                <div class="dataset-item">

                  <datasetImage :src="e.versions[0]?.cover_urls && e.versions[0]?.cover_urls[0]" />
                  <div class="dataset-info">
                    <!-- <n-tooltip trigger="hover" v-if="e.versions[0].annotated">
                      <template #trigger>                        
                        <span class="judge-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M9.52 3a2 2 0 0 1 1.442.614l.12.137L12.48 5.5H20a2 2 0 0 1 1.995 1.85L22 7.5V19a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V5a2 2 0 0 1 1.85-1.995L4 3zm0 2H4v14h16V7.5h-7.52a2 2 0 0 1-1.442-.614l-.12-.137zm4.955 5.232a1 1 0 0 1 1.497 1.32l-.083.095l-4.172 4.172a1.1 1.1 0 0 1-1.46.085l-.095-.085l-2.051-2.051a1 1 0 0 1 1.32-1.498l.094.084l1.414 1.414z"/></g></svg>
                        </span>
                      </template>
                      Labeled
                    </n-tooltip> -->
                    <!-- <span class="judge-icon" v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M9.52 3a2 2 0 0 1 1.442.614l.12.137L12.48 5.5H20a2 2 0 0 1 1.995 1.85L22 7.5V19a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V5a2 2 0 0 1 1.85-1.995L4 3zm0 2H4v14h16V7.5h-7.52a2 2 0 0 1-1.442-.614l-.12-.137zm4.955 5.232a1 1 0 0 1 1.497 1.32l-.083.095l-4.172 4.172a1.1 1.1 0 0 1-1.46.085l-.095-.085l-2.051-2.051a1 1 0 0 1 1.32-1.498l.094.084l1.414 1.414z"/></g></svg>
                    </span> -->
                    <div class="word">
                      <p class="name">{{ e.name }}</p>
                      <p class="hint">{{ e.versions[0].file_num }} files</p>
                    </div>
                    <span class="add-node" @click="addDatasetNode(e)"></span>
                    <n-popover trigger="hover" placement="bottom">
                      <template #trigger>
                        <span class="handle"><svg data-v-60d944c6="" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none" class="cursor-pointer"><path data-v-60d944c6="" d="M8.66659 7.99992C8.66659 7.63173 8.36811 7.33325 7.99992 7.33325C7.63173 7.33325 7.33325 7.63173 7.33325 7.99992C7.33325 8.36811 7.63173 8.66659 7.99992 8.66659C8.36811 8.66659 8.66659 8.36811 8.66659 7.99992Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path><path data-v-60d944c6="" d="M8.66659 3.33325C8.66659 2.96506 8.36811 2.66658 7.99992 2.66658C7.63173 2.66658 7.33325 2.96506 7.33325 3.33325C7.33325 3.70144 7.63173 3.99992 7.99992 3.99992C8.36811 3.99992 8.66659 3.70144 8.66659 3.33325Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path><path data-v-60d944c6="" d="M8.66659 12.6666C8.66659 12.2984 8.36811 11.9999 7.99992 11.9999C7.63173 11.9999 7.33325 12.2984 7.33325 12.6666C7.33325 13.0348 7.63173 13.3333 7.99992 13.3333C8.36811 13.3333 8.66659 13.0348 8.66659 12.6666Z" stroke="#F9FAFB" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                      </template>
                      <span class="handle-item" @click="rename(e.id)">Rename</span>
                      <span class="handle-item" @click="del(e.id)">Delete</span>
                    </n-popover>
                    
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-if="datasetStore.pageCount > 1"  class="pagination">
            <n-pagination 
              v-model:page="datasetStore.current" 
              :page-count="datasetStore.pageCount" 
              :on-update:page="pageChange" />
          </div>
        </div>
      </n-card>
    </n-modal>

    <n-modal 
      :mask-closable="false"
      v-model:show="renameInput">
      <n-card
        style="width: 40vw"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <!-- :on-after-leave="onDialogClose"> -->
        <div class="rename-box">
          <n-input v-model:value="renameDetail.name" />
        </div>
        <template #footer>
          <div class="footer-content">
            <n-button tertiary @click="cancelRename">Cancel</n-button>
            <n-button type="primary" @click="submitRename">Rename</n-button>
          </div>
        </template>

      </n-card>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { useDatasetStore } from '@/stores/datasetStore'
import { NModal, NCard, NInput, NButton, NPopover, NPagination } from 'naive-ui'
// NTooltip
import { del_datasets } from '@/api/dataset'
import datasetImage from './datasetImage.vue'
import { onMounted, ref, watch } from 'vue'
// import { useConfirm } from '@/components/modules/vConfirm/index
import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
import { useToaster } from '@/components/modules/toats/index'
// import { put_dataset, get_datasets_detail } from '@/api/dataset'
import { put_dataset } from '@/api/dataset'
// import vRadio from '@/components/modules/vRadio.vue'

const props = defineProps ({
  showDatasetSelect: Boolean,
  isNodeSelect: Boolean
})

const datasetStore = useDatasetStore()
const renameInput = ref(false)
const renameDetail = ref<any>({})

const test = ref(false)

const emit = defineEmits(['apply', 'close'])
const onDialogClose = () => {
  datasetStore.setListDialog(false)
  emit('close')
}

// const fileterData = [
//   { name: 'All', value: '', active: 'active', fn: () => datasetStore.fileterList('') },
//   { name: 'Labeled', value: 'true', fn: () => datasetStore.fileterList('true') }
// ]

const rename = async (id: number) => {
  renameInput.value = true
  renameDetail.value = {...datasetStore.tableData.find(e => e.id === id)}
  // console.log(await get_datasets_detail({ id }))
}
const cancelRename = () => {
  renameInput.value = false
}
const submitRename = async () => {
  console.log(renameDetail.value)
  if (renameDetail.value.name === '') {
    useToaster({
      type: 'error',
      message: 'Please enter the dataset name'
    })
    return
  }
  await put_dataset({ ...renameDetail.value })
  await datasetStore.getDatasetList()
  renameInput.value = false
}

const del = async (id: number) => {
  // const res = await useConfirm({
  //   title: 'Are you sure you want to delete it?',
  //   content: 'This action cannot be undone.',
  //   cancelText: 'No, Keep It',
  //   continueText: 'Yes, Delete It',
  // })
  // if (!res) return
  const res = await useAlertDialog({
    title: 'Are you sure you want to delete it?',
    desc: 'This action cannot be undone.',
    cancel: 'No, Keep It',
    continue: 'Yes, Delete It',
    z: 'z-9000'
  })
  if (!res) return
  await del_datasets({ id })
  datasetStore.getDatasetList()
}

const pageChange = (page: number) => {
  datasetStore.current = page
  datasetStore.getDatasetList()
}
const toUpload = () => {
  datasetStore.setListDialog(false)
  datasetStore.setUploadDialog(true)
}


const addDatasetNode = (e: any) => {
  console.log('test.value---------', test.value)
  if (props.isNodeSelect) {
    emit('apply', e.versions?.[0]?.id, e.name)
    return
  }
  let nodeID = "BizyAir_TrainDatasetAdd"
  let loraLoaderNode = window.LiteGraph?.createNode(nodeID)
  const canvas = window.LGraphCanvas?.active_canvas

  if (loraLoaderNode && canvas) {
    loraLoaderNode.title = "☁️BizyAir TrainDatasetAdd"
    console.log(e.versions?.[0]?.id)
    const widgetValues = [1024, 1024, 2, e.name ,e.versions?.[0]?.id || 0]

    loraLoaderNode.widgets_values = widgetValues
    if (loraLoaderNode.widgets) {
      loraLoaderNode.widgets.forEach((widget: any, index: number) => {
        if (widget && widgetValues[index] !== undefined) {
          widget.value = widgetValues[index]
        }
      })
    }
    const currentConfig = canvas.graph.serialize()
    const nodeCount = currentConfig.nodes?.length || 0

    const visibleRect = canvas.visible_area
    const offsetX = (nodeCount % 3) * 30
    const offsetY = Math.floor(nodeCount / 3) * 25
    const baseX = visibleRect ? visibleRect[0] + 100 : 100
    const baseY = visibleRect ? visibleRect[1] + 100 : 100

    loraLoaderNode.pos = [baseX + offsetX, baseY + offsetY]

    canvas.graph.add(loraLoaderNode)

    datasetStore.setListDialog(false)

    useToaster.success('Node added successfully')
    
  }
}
watch(() => props.isNodeSelect, (val) => {
  test.value = val
}, { immediate: true })
watch(() => props.showDatasetSelect, (val) => {
  console.log('showDatasetSelect', val)
  if (val) {
    datasetStore.setListDialog(true)
  } else {
    datasetStore.setListDialog(false)
  }
}, { immediate: true })
onMounted(() => {
  datasetStore.getDatasetList()
  console.log('datasetStore.showListDialog', datasetStore.showListDialog)
})
</script>
<style scoped lang="less">
.dataset-box{
  height: calc(82vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 20px;
}
.header{
  display: flex;
  justify-content: space-between;
  height: 36px;
  padding-right: 20px;
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
.dataset-list-box{
  flex: 1;
  width: 100%;
  margin: 0 -10px;
  overflow-y: auto;
}
.dataset-list{
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  li{
    width: (1/10)*100%;
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
      // height: 260px;
      // overflow: hidden;
    }
    button{
      position: absolute;
      bottom: 0;
      left: 0;
    }

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
      height: 70px;
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
    .hint{
      font-size: 12px;
    }
    .add-node{
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-dasharray='40' stroke-dashoffset='40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 6l10 6l-10 6Z'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' dur='0.5s' values='40;0'/%3E%3C/path%3E%3C/svg%3E");
      mask-size: 100% 100%;
      background-color: #FFF;
      cursor: pointer;
      position: absolute;
      // left: 50%;
      // top: 50%;
      // transform: translate(-50%, -50%);
      // transition: all .3s;
      // opacity: 0;
      right: 32px;
      top: 10px;
      width: 24px;
      height: 24px;
      cursor: pointer;
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
      // background-color: rgba(0, 0, 0, 0.6);
      // border-radius: 0.5rem;
      .word{
        background: rgba(0, 0, 0, 0);
      }
      .add-node{
        // opacity: 1;
      }
    }


  }
  &::after{
    content: '';
    display: block;
  }
}
// .dataset-info{
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   background-color: rgba(0, 0, 0, 0);
//   transition: all .3s;
  
// }
.handle-item{
  display: block;
  cursor: pointer;
}
.pagination{
  display: flex;
  justify-content: center;
  padding: 20px 0 0 0;
  box-shadow: 0px -10px 10px rgba(0, 0, 0, 0.1);
  margin: 0 -16px;
}
.rename-box{
  padding-top: 20px;
}
.footer-content{
  display: flex;
  justify-content: end;
  gap: 20px;
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
