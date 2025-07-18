<script setup lang="ts">
  import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

  import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator
  } from '@/components/ui/command'

  import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
  import { useCommunityStore } from '@/stores/communityStore'

  import { sliceString, formatSize, formatNumber } from '@/utils/tool'
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
  import { Button } from '@/components/ui/button'
  import { ref, onMounted, nextTick, inject } from 'vue'
  import { NImageGroup, NImage } from 'naive-ui'
  import vTooltips from '@/components/modules/v-tooltip.vue'
  import { useAlertDialog } from '@/components/modules/vAlertDialog/index'
  import { MdPreview } from 'md-editor-v3'
  import { modelStore } from '@/stores/modelStatus'
  import { useStatusStore } from '@/stores/userStatus'
  import { Model, ModelVersion } from '@/types/model'
  import { useDictStore } from '@/stores/dictStore'
  import vDialog from '@/components/modules/vDialog.vue'
  import LoadingOverlay from '@/components/community/modules/LoadingOverlay.vue'
  import {
    model_detail,
    like_model,
    fork_model,
    un_fork_model,
    remove_model,
    get_workflow_dowload_url
  } from '@/api/model'
  import { useToaster } from '@/components/modules/toats/index'
  import 'md-editor-v3/lib/style.css'
  import { debounce } from 'lodash-es'
  import { create_share_code } from '@/api/model'
  import { useI18n } from 'vue-i18n'

  const communityStore = useCommunityStore()
  const userStatusStore = useStatusStore()
  const tagsStore = useDictStore()
  const model = ref<Model>()
  const currentVersion = ref<ModelVersion>()
  const downloadOpen = ref(false)
  const scrollViewportRef = ref<any | null>(null)
  const modelStoreInstance = modelStore()
  const isLoading = ref(false)
  const { t } = useI18n()
  const comfyUIApp: any = inject('comfyUIApp')

  const activeTab = ref<number>()

  const showAllTags = ref(false)
  const showCopyDialog = ref(false)
  const copyText = ref('')

  // 添加视频检测函数
  const isVideoUrl = (url: string) => {
    if (!url) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    const lowercaseUrl = url.toLowerCase()
    return videoExtensions.some(ext => lowercaseUrl.includes(ext))
  }

  const fetchModelDetail = async () => {
    try {
      const res = await model_detail({
        id: communityStore.modelId,
        source: communityStore.TabSource
      })
      if (!res.data) {
        useToaster.error('Model not found.')
        return
      }
      model.value = res.data
      initializeScroll()
      isLoading.value = false
    } catch (error) {
      useToaster.error('Failed to fetch model details')
      isLoading.value = false
    }
  }

  const initializeScroll = () => {
    if (model.value && model.value.versions && model.value.versions.length > 0) {
      if (communityStore.versionId) {
        const targetVersion = model.value.versions.find(v => v.id === communityStore.versionId)
        if (targetVersion) {
          currentVersion.value = { ...targetVersion }
          nextTick(() => {
            scrollWithDelay(communityStore.versionId)
          })
        }
      } else {
        currentVersion.value = { ...model.value.versions[0] }
        nextTick(() => {
          if (currentVersion.value?.id) {
            scrollWithDelay(currentVersion.value.id)
          }
        })
      }
    }
  }

  onMounted(async () => {
    await tagsStore.fetchDictData()
    isLoading.value = true
    await fetchModelDetail()
  })

  const handleTabChange = (value: number) => {
    const version = model.value?.versions?.find(v => v.id === value)
    if (version) {
      currentVersion.value = version
      activeTab.value = value
    }
  }

  const handleDownload = () => {
    downloadOpen.value = !downloadOpen.value
  }

  const handleLike = debounce(async () => {
    if (!currentVersion.value) return

    await like_model(currentVersion.value.id)
    const delta = currentVersion.value.liked ? -1 : 1

    if (currentVersion.value.counter) {
      currentVersion.value.counter.liked_count = Math.max(
        0,
        (currentVersion.value.counter.liked_count || 0) + delta
      )
      currentVersion.value.liked = !currentVersion.value.liked
    }

    if (model.value?.counter) {
      if (model.value.versions?.length === 1) {
        model.value.counter.liked_count = currentVersion.value.counter?.liked_count || 0
      } else {
        model.value.counter.liked_count =
          model.value.versions?.reduce((sum, version) => {
            return sum + (version.counter?.liked_count || 0)
          }, 0) || 0
      }
    }
  }, 300)

  const openInWeb = () => {
    const url = `https://bizyair.cn/community/models/${communityStore.TabSource}/${model.value?.id}?version=${currentVersion.value?.id}`
    window.open(url, '_blank')
  }

  const getShareCode = async () => {
    if (!currentVersion.value) return
    isLoading.value = true
    const res = await create_share_code({ biz_id: currentVersion.value.id })
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(res.data.code)
        useToaster.success('The share code has been copied!')
        isLoading.value = false
      } else {
        const input = document.createElement('input')
        input.value = res.data.code
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        isLoading.value = false
      }
    } catch (err) {
      useToaster.error('Copy failed.')
      isLoading.value = false
    }
  }

  const handleFork = debounce(async () => {
    if (!currentVersion.value || !model.value?.versions) return

    if (communityStore.TabSource === 'my_fork') {
      if (model.value.versions.length <= 1) {
        const res = await useAlertDialog({
          title: t('community.detail.confirmUnfork', [
            model.value?.type === 'Workflow'
              ? t('community.detail.workflow')
              : t('community.detail.model')
          ]),
          desc: t('community.detail.unforkWarning'),
          cancel: t('confirm.cancel'),
          continue: t('community.detail.confirmUnforkBtn'),
          z: 'z-12000'
        })
        if (!res) return

        await un_fork_model(currentVersion.value.id)
        communityStore.showCommunityDetail = false
        communityStore.reload++
      } else {
        await un_fork_model(currentVersion.value.id)
        const currentIndex = model.value.versions.findIndex(v => v.id === currentVersion.value?.id)
        model.value.versions.splice(currentIndex, 1)
        const nextVersion =
          model.value.versions[currentIndex] || model.value.versions[currentIndex - 1]
        if (nextVersion) {
          handleTabChange(nextVersion.id)
          activeTab.value = nextVersion.id
          nextTick(() => {
            scrollWithDelay(nextVersion.id)
          })
        }
      }
      return
    }

    if (!currentVersion.value.forked) {
      await fork_model(currentVersion.value.id)
      currentVersion.value.forked = true
    } else {
      await un_fork_model(currentVersion.value.id)
      currentVersion.value.forked = false
    }

    const delta = currentVersion.value.forked ? 1 : -1

    if (currentVersion.value.counter) {
      currentVersion.value.counter.forked_count = Math.max(
        0,
        (currentVersion.value.counter.forked_count || 0) + delta
      )
    }

    if (model.value?.counter) {
      if (model.value.versions.length === 1) {
        model.value.counter.forked_count = currentVersion.value.counter?.forked_count || 0
      } else {
        model.value.counter.forked_count =
          model.value.versions.reduce((sum, version) => {
            return sum + (version.counter?.forked_count || 0)
          }, 0) || 0
      }
    }
  }, 300)

  const scrollToTab = (versionId: number) => {
    nextTick(() => {
      setTimeout(() => {
        if (!scrollViewportRef.value) return
        const viewport = scrollViewportRef.value.$el.querySelector(
          '[data-radix-scroll-area-viewport]'
        )
        const tabsList = viewport?.querySelector('[role="tablist"]')
        const targetTab = tabsList?.querySelector(
          `[role="tab"].version-tab-${versionId}`
        ) as HTMLElement
        if (!viewport || !targetTab || !tabsList) return

        const tabs = Array.from(tabsList.querySelectorAll('[role="tab"]'))
        const totalWidth = tabs.reduce(
          (sum: number, tab) => sum + (tab as HTMLElement).offsetWidth,
          0
        )
        ;(tabsList as HTMLElement).style.width = `${totalWidth}px`

        const tabPosition = targetTab.offsetLeft
        const viewportWidth = viewport.clientWidth
        const tabWidth = targetTab.offsetWidth

        const scrollPosition = Math.max(0, tabPosition - (viewportWidth - tabWidth) / 2)

        viewport.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }, 100)
    })
  }

  const scrollWithDelay = (versionId: number) => {
    setTimeout(() => {
      scrollToTab(versionId)
    }, 200)
  }

  const handleModelOperation = async (type: 'edit' | 'remove', id: string | number) => {
    if (type === 'edit') {
      modelStoreInstance.setModelDetail(model)
      if (model.value?.type === 'Workflow') {
        modelStoreInstance.setDialogStatusWorkflow(true, Number(currentVersion.value?.id))
      } else {
        modelStoreInstance.setDialogStatus(true, Number(currentVersion.value?.id))
      }
      downloadOpen.value = false
      communityStore.showCommunityDetail = false
      communityStore.reload++
    }
    if (type === 'remove') {
      downloadOpen.value = false
      const res = await useAlertDialog({
        title: t('community.detail.confirmDelete', [
          model.value?.type === 'Workflow'
            ? t('community.detail.workflow')
            : t('community.detail.model')
        ]),
        desc: t('community.detail.deleteWarning'),
        cancel: t('confirm.cancel'),
        continue: t('community.detail.confirmDeleteBtn'),
        z: 'z-12000'
      })
      if (!res) return

      if (model.value?.versions) {
        const hasPublic = model.value?.versions.some(version => version.public)
        if (hasPublic) {
          useToaster.warning('Model has public version, cannot remove.')
          return
        }
      }
      handleRemoveModel(id)
    }
  }

  const handleRemoveModel = async (id: number | string) => {
    try {
      await remove_model(id)
      useToaster.success(t('community.detail.modelRemovedSuccessfully'))
      communityStore.showCommunityDetail = false
      communityStore.reload++
    } catch (error) {
      useToaster.error('Failed to Remove .')
      console.error('Error removing :', error)
    }
  }

  const handleCopy = async (sign: string) => {
    if (!navigator.clipboard) {
      copyText.value = sign
      showCopyDialog.value = true
      return;
    }

    navigator.clipboard
      .writeText(sign)
      .then(() => useToaster.success(t('community.detail.copiedSuccessfully')))
      .catch(error => {
        console.error('复制失败:', error);
        copyText.value = sign
        showCopyDialog.value = true
      });
  }

  const handleLoadWorkflow = async () => {
    try {
      isLoading.value = true
      const workflow = await get_workflow_dowload_url(
        currentVersion.value?.id,
        currentVersion.value?.sign
      )
      if (workflow.data && comfyUIApp && comfyUIApp.graph) {
        comfyUIApp.graph.clear()
        if (workflow.data.templates && workflow.data.templates.length > 0) {
          await comfyUIApp.loadTemplateData(workflow.data)
        } else {
          await comfyUIApp.loadGraphData(workflow.data)
        }
      } else {
        useToaster.error(t('community.detail.failedLoadWorkflow'))
      }
      communityStore.showDialog = false
      communityStore.showCommunityDetail = false
    } catch (error) {
      useToaster.error(t('community.detail.failedLoadWorkflow'))
    } finally {
      isLoading.value = false
    }
  }

  const handleAddNode = async () => {
    try {
      isLoading.value = true
      const nodeTypes: Record<string, string> = {
        LoRA: 'BizyAir_LoraLoader',
        Controlnet: 'BizyAir_ControlNetLoader',
        Checkpoint: 'BizyAir_CheckpointLoaderSimple',
        Clip: 'BizyAir_CLIPVisionLoader',
        Ipadapter: 'BizyAir_IPAdapterModelLoade',
        Unet: 'BizyAir_MZ_KolorsUNETLoaderV2',
        Vae: 'BizyAir_VAELoader',
        Upscale_models: 'BizyAir_UpscaleModelLoader',
        Instantid: 'BizyAir_InstantIDModelLoader',
        Pulid: 'BizyAir_PulidFluxModelLoader'
      }
      let nodeID = nodeTypes[(model.value as any).type] || 'BizyAir_ControlNetLoader'
      let loraLoaderNode = window.LiteGraph?.createNode(nodeID)
      const canvas = window.LGraphCanvas?.active_canvas

      loraLoaderNode.title = `☁️BizyAir Load ${(model.value as any).type}`
      loraLoaderNode.color = '#7C3AED'

      const widgetValues =
        model.value?.type === 'LoRA'
          ? [model.value?.name, 1.0, 1.0, currentVersion.value?.id || '']
          : [model.value?.name, currentVersion.value?.id || '']

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
      communityStore.showDialog = false
      communityStore.showCommunityDetail = false
      useToaster.success(t('community.detail.nodeAddedSuccessfully'))
    } catch (error) {
      console.error('Failed to add node:', error)
      useToaster.error(t('community.detail.failedAddNode') + error)
    } finally {
      isLoading.value = false
    }
  }

  const handleDownloadWorkFlow = async () => {
    const workflow = await get_workflow_dowload_url(
      currentVersion.value?.id,
      currentVersion.value?.sign
    )
    if (workflow?.data) {
      const jsonString = JSON.stringify(workflow.data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${model.value?.name}-${currentVersion.value?.version}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      useToaster.error(t('community.detail.failedDownloadWorkflow'))
    }
  }

  const handleTagClick = (tagId: string) => {
    console.log('tagId', tagId)
    // Implement the logic to handle tag click
  }

  const handleShowAllTags = () => {
    showAllTags.value = true
  }
</script>

<template>
  <v-dialog
    v-model:open="communityStore.showCommunityDetail"
    class="px-6 overflow-visible pb-6 z-10000 max-w-[90%] bg-[#353535]"
    layout-class="z-10000"
    content-class="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
  >
    <div
      v-if="!isLoading && model"
      class="p-6 pb-12 flex flex-col gap-4 items-start justify-start min-w-[1000px] relative shadow-[0px_20px_40px_0px_rgba(0,0,0,0.25)]"
    >
      <div class="flex flex-col gap-1.5 items-start justify-start self-stretch shrink-0 relative">
        <div class="flex flex-row gap-2 items-center justify-start self-stretch shrink-0 relative">
          <div
            class="text-text-text-foreground text-left font-['Inter-SemiBold',_sans-serif] text-lg leading-[18px] font-semibold relative"
            style="letter-spacing: -0.025em"
          >
            {{ sliceString(model?.name, 60) }}
          </div>
          <div class="flex flex-row gap-1 items-start justify-start shrink-0 relative">
            <div
              v-if="model?.type !== 'Workflow'"
              class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
            >
              <vTooltips :tips="t('community.modelCard.tooltips.used')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.33325 2L12.6666 8L3.33325 14V2Z"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </vTooltips>
              <div
                class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
              >
                {{ formatNumber(model?.counter?.used_count) }}
              </div>
            </div>
            <div
              v-else
              class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
            >
              <vTooltips :tips="t('community.modelCard.tooltips.downloaded')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </vTooltips>
              <div
                class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
              >
                {{ formatNumber(model?.counter?.downloaded_count) }}
              </div>
            </div>
          </div>
          <div
            class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
          >
            <vTooltips :tips="t('community.modelCard.tooltips.forked')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M7.99992 1.33325L10.0599 5.50659L14.6666 6.17992L11.3333 9.42659L12.1199 14.0133L7.99992 11.8466L3.87992 14.0133L4.66659 9.42659L1.33325 6.17992L5.93992 5.50659L7.99992 1.33325Z"
                  stroke="#F9FAFB"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </vTooltips>
            <div
              class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
            >
              {{ formatNumber(model?.counter?.forked_count) }}
            </div>
          </div>
          <div
            class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
          >
            <vTooltips :tips="t('community.modelCard.tooltips.liked')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clip-path="url(#clip0_315_3742)">
                  <path
                    d="M4.66659 6.66658V14.6666M9.99992 3.91992L9.33325 6.66658H13.2199C13.4269 6.66658 13.6311 6.71478 13.8162 6.80735C14.0013 6.89992 14.1624 7.03432 14.2866 7.19992C14.4108 7.36551 14.4947 7.55775 14.5317 7.7614C14.5688 7.96506 14.5579 8.17454 14.4999 8.37325L12.9466 13.7066C12.8658 13.9835 12.6974 14.2268 12.4666 14.3999C12.2358 14.573 11.9551 14.6666 11.6666 14.6666H2.66659C2.31296 14.6666 1.97382 14.5261 1.72378 14.2761C1.47373 14.026 1.33325 13.6869 1.33325 13.3333V7.99992C1.33325 7.6463 1.47373 7.30716 1.72378 7.05711C1.97382 6.80706 2.31296 6.66658 2.66659 6.66658H4.50659C4.75464 6.66645 4.99774 6.59713 5.20856 6.4664C5.41937 6.33567 5.58953 6.14873 5.69992 5.92659L7.99992 1.33325C8.3143 1.33715 8.62374 1.41203 8.90512 1.55232C9.1865 1.6926 9.43254 1.89466 9.62486 2.14339C9.81717 2.39212 9.9508 2.68109 10.0157 2.98872C10.0807 3.29635 10.0753 3.61468 9.99992 3.91992Z"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_315_3742">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </vTooltips>
            <div
              class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
            >
              {{ formatNumber(model?.counter?.liked_count) }}
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-1">
          <template v-for="tagId in (model?.tags || []).slice(0, 6)" :key="tagId">
            <div
              class="px-2 py-0.5 text-xs text-[#F9FAFB] rounded cursor-pointer transition-colors"
              :class="tagsStore.getTagById(tagId)?.class || 'model-tag'"
              @click="handleTagClick(tagId)"
            >
              {{ tagsStore.getTagById(tagId)?.label }}
            </div>
          </template>

          <div
            v-if="(model?.tags || []).length > 6 && !showAllTags"
            class="px-2 py-0.5 text-xs bg-[rgb(105,109,118)]/80 text-white rounded cursor-pointer hover:bg-[#5B21B6] hover:scale-105 transition-colors"
            @click="handleShowAllTags"
          >
            +{{ model?.tags.length - 6 }}
          </div>

          <template v-if="showAllTags">
            <template v-for="tagId in (model?.tags || []).slice(6)" :key="tagId">
              <div
                class="px-2 py-0.5 text-xs bg-[#4E4E4E] text-[#F9FAFB] rounded cursor-pointer hover:bg-[#6D28D9] hover:scale-105 transition-colors"
                :class="tagsStore.getTagById(tagId)?.class || 'model-tag'"
                @click="handleTagClick(tagId)"
              >
                {{ tagsStore.getTagById(tagId)?.label }}
              </div>
            </template>
          </template>
        </div>
        <div class="flex flex-row gap-1 items-center justify-start self-stretch shrink-0 relative">
          <div
            class="bg-[#4e4e4e] rounded-lg p-1 flex flex-row gap-4 items-start justify-start self-stretch shrink-0 relative"
          >
            <div class="max-w-[1000px]">
              <ScrollArea ref="scrollViewportRef" class="rounded-md w-full">
                <div class="whitespace-nowrap">
                  <Tabs v-model="activeTab" :default-value="currentVersion?.id">
                    <TabsList class="inline-flex h-12 bg-transparent text-sm text-white w-auto">
                      <TabsTrigger
                        v-for="version in model?.versions"
                        :key="version.id"
                        :value="version.id"
                        :class="['version-tab', `version-tab-${version.id}`]"
                        class="text-sm t bg-[#9CA3AF] data-[state=active]:bg-[#7C3AED] h-10 px-3 py-2 mx-1"
                        @click="handleTabChange(version.id)"
                      >
                        {{ version.version }}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
          <div
            class="text-text-text-muted-foreground text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal relative flex-1"
          ></div>

          <div class="flex gap-4">
            <vTooltips
              v-if="communityStore.TabSource === 'publicity'"
              :tips="t('community.detail.share')"
            >
              <div
                @click="getShareCode"
                class="w-[48px] h-[48px] bg-[#4e4e4e] hover:bg-[#4e4e4e]/60 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M15.991 1.035a4 4 0 1 1-.855 6.267l-6.28 3.626q.147.533.145 1.072c0 .358-.047.719-.145 1.072l6.28 3.626a4.002 4.002 0 0 1 6.32 4.803a4 4 0 0 1-7.32-3.07l-6.28-3.627a4.002 4.002 0 1 1 0-5.608l6.28-3.626a4 4 0 0 1 1.855-4.535M19.723 3.5a2 2 0 1 0-3.464 2a2 2 0 0 0 3.464-2M3.071 12.527a2.002 2.002 0 0 0 2.93 1.204a2 2 0 1 0-2.93-1.204m15.92 5.242a2 2 0 1 0-2 3.464a2 2 0 0 0 2-3.464"
                  />
                </svg>
              </div>
            </vTooltips>
            <vTooltips
              :tips="
                currentVersion?.liked
                  ? t('community.detail.tooltips.liked')
                  : t('community.detail.tooltips.like')
              "
            >
              <div
                class="w-[48px] h-[48px] rounded-lg flex items-center justify-center cursor-pointer"
                :class="[
                  currentVersion?.liked
                    ? 'bg-[#6D28D9] hover:bg-[#6D28D9]/80'
                    : 'bg-[#4e4e4e] hover:bg-[#4e4e4e]/60'
                ]"
                @click="handleLike"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <g clip-path="url(#clip0_440_1289)">
                    <path
                      d="M4.66659 6.66658V14.6666M9.99992 3.91992L9.33325 6.66658H13.2199C13.4269 6.66658 13.6311 6.71478 13.8162 6.80735C14.0013 6.89992 14.1624 7.03432 14.2866 7.19992C14.4108 7.36551 14.4947 7.55775 14.5317 7.7614C14.5688 7.96506 14.5579 8.17454 14.4999 8.37325L12.9466 13.7066C12.8658 13.9835 12.6974 14.2268 12.4666 14.3999C12.2358 14.573 11.9551 14.6666 11.6666 14.6666H2.66659C2.31296 14.6666 1.97382 14.5261 1.72378 14.2761C1.47373 14.026 1.33325 13.6869 1.33325 13.3333V7.99992C1.33325 7.6463 1.47373 7.30716 1.72378 7.05711C1.97382 6.80706 2.31296 6.66658 2.66659 6.66658H4.50659C4.75464 6.66645 4.99774 6.59713 5.20856 6.4664C5.41937 6.33567 5.58953 6.14873 5.69992 5.92659L7.99992 1.33325C8.3143 1.33715 8.62374 1.41203 8.90512 1.55232C9.1865 1.6926 9.43254 1.89466 9.62486 2.14339C9.81717 2.39212 9.9508 2.68109 10.0157 2.98872C10.0807 3.29635 10.0753 3.61468 9.99992 3.91992Z"
                      stroke="#F9FAFB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_440_1289">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </vTooltips>

            <vTooltips :tips="t('community.detail.open')">
              <div
                @click="openInWeb"
                class="w-[48px] h-[48px] bg-[#4e4e4e] hover:bg-[#4e4e4e]/60 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="none"
                    stroke="#FFF"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                    d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48M336 64h112v112M224 288L440 72"
                  />
                </svg>
              </div>
            </vTooltips>

            <Popover
              v-if="['my', 'my_fork'].includes(communityStore.TabSource)"
              class="bg-[#353535]"
              :open="downloadOpen"
              @update:open="handleDownload"
            >
              <PopoverTrigger class="bg-transparent">
                <div
                  class="w-[48px] h-[48px] bg-[#4e4e4e] hover:bg-[#4e4e4e]/60 rounded-lg flex items-center justify-center cursor-pointer relative z-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    class="cursor-pointer"
                  >
                    <path
                      d="M8.66659 7.99992C8.66659 7.63173 8.36811 7.33325 7.99992 7.33325C7.63173 7.33325 7.33325 7.63173 7.33325 7.99992C7.33325 8.36811 7.63173 8.66659 7.99992 8.66659C8.36811 8.66659 8.66659 8.36811 8.66659 7.99992Z"
                      stroke="#F9FAFB"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.66659 3.33325C8.66659 2.96506 8.36811 2.66658 7.99992 2.66658C7.63173 2.66658 7.33325 2.96506 7.33325 3.33325C7.33325 3.70144 7.63173 3.99992 7.99992 3.99992C8.36811 3.99992 8.66659 3.70144 8.66659 3.33325Z"
                      stroke="#F9FAFB"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.66659 12.6666C8.66659 12.2984 8.36811 11.9999 7.99992 11.9999C7.63173 11.9999 7.33325 12.2984 7.33325 12.6666C7.33325 13.0348 7.63173 13.3333 7.99992 13.3333C8.36811 13.3333 8.66659 13.0348 8.66659 12.6666Z"
                      stroke="#F9FAFB"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                class="w-[150px] p-0 bg-[#353535] rounded-lg group-hover:visible z-15000"
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-if="['my'].includes(communityStore.TabSource)"
                        value="edit"
                        class="px-2 py-1.5 mb-1 text-[#F9FAFB] cursor-pointer [&:hover]:!bg-[#6D28D9] [&:hover]:!text-[#F9FAFB]"
                        @click="handleModelOperation('edit', model?.id)"
                      >
                        {{ t('community.detail.edit') }}
                      </CommandItem>
                      <CommandSeparator />
                      <CommandItem
                        value="remove"
                        class="px-2 py-1.5 mb-1 mt-1 text-[#F9FAFB] cursor-pointer [&:hover]:!bg-[#6D28D9] [&:hover]:!text-[#F9FAFB]"
                        @click="handleModelOperation('remove', model?.id)"
                      >
                        {{ t('community.detail.remove') }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div class="flex flex-row gap-4 items-start justify-start shrink-0 relative">
          <div
            class="text-text-text-muted-foreground text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal relative"
          >
            {{ t('community.detail.firstPublished') }} {{ currentVersion?.created_at }}
          </div>
          <div
            class="text-text-text-muted-foreground text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal relative"
          >
            {{ t('community.detail.lastUpdated') }} {{ currentVersion?.updated_at }}
          </div>
        </div>
      </div>
      <div class="flex flex-row gap-8 items-start justify-start self-stretch flex-1 relative">
        <div
          class="flex flex-col gap-4 items-start justify-start relative min-w-[620px] w-[65%] overflow-hidden"
        >
          <div class="w-full">
            <div
              v-if="currentVersion?.cover_urls && currentVersion?.cover_urls.length > 0"
              class="space-y-4"
            >
              <div v-for="(cover, index) in currentVersion?.cover_urls" :key="index" class="w-full">
                <!-- 视频显示 -->
                <video
                  v-if="isVideoUrl(cover)"
                  :src="cover"
                  controls
                  class="w-full h-auto max-h-[512px] object-contain rounded-lg"
                  preload="metadata"
                />
                <!-- 图片显示 -->
                <NImageGroup v-else>
                  <NImage
                    :src="cover"
                    :preview-src="cover"
                    height="512px"
                    class="w-full object-contain"
                  />
                </NImageGroup>
              </div>
            </div>
            <MdPreview
              v-if="currentVersion?.intro"
              id="previewRef"
              :model-value="currentVersion?.intro"
              :no-img-zoom-in="true"
              :preview="true"
              theme="dark"
              class="bg-[#353535] w-full h-[80vh] line-height-[2rem]"
            />
            <div v-else class="w-full h-[200px] bg-[#353535] rounded-tl-lg rounded-tr-lg">
              <div class="flex justify-center items-center h-full">
                <div
                  class="text-text-text-muted-foreground text-left font-['Inter-Regular',_sans-serif] text-xs leading-5 font-normal relative"
                >
                  {{ t('community.noIntroduction') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-6 items-start justify-start w-[40%] relative">
          <div
            class="pb-8 flex flex-col gap-6 items-start justify-start shrink-0 h-[97px] relative"
          >
            <div class="flex flex-row gap-2 items-center justify-start shrink-0 relative">
              <Avatar>
                <AvatarImage
                  :src="
                    currentVersion && currentVersion.parent_id > 0
                      ? currentVersion.original_user_avatar ||
                        'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250311/ViKdyI5vrD7XGNCXHuVTW4sPUXNusj3W.webp'
                      : currentVersion?.user_avatar ||
                        'https://bizyair-prod.oss-cn-shanghai.aliyuncs.com/img/20250311/ViKdyI5vrD7XGNCXHuVTW4sPUXNusj3W.webp'
                  "
                  alt="user avatar"
                />
                <AvatarFallback>{{
                  currentVersion && currentVersion.parent_id > 0
                    ? currentVersion.original_user_name?.slice(0, 2) || ''
                    : currentVersion?.user_name?.slice(0, 2) || ''
                }}</AvatarFallback>
              </Avatar>
              {{
                currentVersion && currentVersion.parent_id > 0
                  ? currentVersion.original_user_name
                  : currentVersion?.user_name
              }}
            </div>
            <div
              class="flex flex-row gap-1.5 items-start justify-start self-stretch shrink-0 relative"
            >
              <Button
                v-if="
                  (['publicity'].includes(communityStore.TabSource) &&
                    userStatusStore.infoData.id !== model?.user_id) ||
                  ['my_fork'].includes(communityStore.TabSource)
                "
                variant="default"
                class="w-[124px] flex h-9 px-3 py-2 justify-center items-center gap-2 flex-1 rounded-md bg-[#6D28D9]"
                @click="handleFork"
              >
                <template v-if="['my_fork'].includes(communityStore.TabSource)">
                  {{ t('community.detail.unFork') }}
                </template>
                <template v-else>
                  {{
                    currentVersion?.forked
                      ? t('community.detail.unFork')
                      : t('community.detail.fork')
                  }}
                </template>
              </Button>
              <Button
                v-if="model?.type !== 'Workflow'"
                class="flex w-[170px] px-8 py-2 justify-center items-center gap-2 bg-[#F43F5E] hover:bg-[#F43F5E]/90 rounded-[6px]"
                :disabled="isLoading"
                @click="handleAddNode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                >
                  <path
                    d="M6.49988 7.9999L7.83322 9.33324L10.4999 6.66657M3.06655 5.74657C2.96925 5.30825 2.98419 4.85246 3.10999 4.42146C3.23579 3.99046 3.46838 3.5982 3.7862 3.28105C4.10401 2.9639 4.49676 2.73213 4.92802 2.60723C5.35929 2.48233 5.81511 2.46835 6.25322 2.56657C6.49436 2.18944 6.82655 1.87907 7.21919 1.66409C7.61182 1.44911 8.05225 1.33643 8.49988 1.33643C8.94752 1.33643 9.38795 1.44911 9.78058 1.66409C10.1732 1.87907 10.5054 2.18944 10.7466 2.56657C11.1853 2.46792 11.6419 2.48184 12.0739 2.60704C12.5058 2.73225 12.8991 2.96466 13.2171 3.28267C13.5351 3.60068 13.7675 3.99395 13.8927 4.4259C14.0179 4.85786 14.0319 5.31446 13.9332 5.75324C14.3104 5.99437 14.6207 6.32657 14.8357 6.7192C15.0507 7.11183 15.1634 7.55227 15.1634 7.9999C15.1634 8.44754 15.0507 8.88797 14.8357 9.2806C14.6207 9.67323 14.3104 10.0054 13.9332 10.2466C14.0314 10.6847 14.0175 11.1405 13.8926 11.5718C13.7677 12.003 13.5359 12.3958 13.2187 12.7136C12.9016 13.0314 12.5093 13.264 12.0783 13.3898C11.6473 13.5156 11.1915 13.5305 10.7532 13.4332C10.5124 13.8118 10.1799 14.1235 9.78663 14.3394C9.39333 14.5554 8.9519 14.6686 8.50322 14.6686C8.05453 14.6686 7.6131 14.5554 7.2198 14.3394C6.8265 14.1235 6.49404 13.8118 6.25322 13.4332C5.81511 13.5315 5.35929 13.5175 4.92802 13.3926C4.49676 13.2677 4.10401 13.0359 3.7862 12.7188C3.46838 12.4016 3.23579 12.0093 3.10999 11.5783C2.98419 11.1473 2.96925 10.6916 3.06655 10.2532C2.68652 10.0127 2.37349 9.68002 2.15658 9.28605C1.93967 8.89207 1.82593 8.44964 1.82593 7.9999C1.82593 7.55016 1.93967 7.10773 2.15658 6.71376C2.37349 6.31979 2.68652 5.98707 3.06655 5.74657Z"
                    stroke="#F9FAFB"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ t('community.detail.addNode') }}
              </Button>

              <Button
                v-if="model?.type === 'Workflow'"
                class="flex w-[170px] px-8 py-2 justify-center items-center gap-2 bg-[#F43F5E] hover:bg-[#F43F5E]/90 rounded-[6px]"
                :disabled="isLoading"
                @click="handleLoadWorkflow"
              >
                <template v-if="isLoading">
                  <svg
                    class="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span class="ml-1">{{ t('community.detail.loading') }}</span>
                </template>
                <template v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                  >
                    <path
                      d="M6.49988 7.9999L7.83322 9.33324L10.4999 6.66657M3.06655 5.74657C2.96925 5.30825 2.98419 4.85246 3.10999 4.42146C3.23579 3.99046 3.46838 3.5982 3.7862 3.28105C4.10401 2.9639 4.49676 2.73213 4.92802 2.60723C5.35929 2.48233 5.81511 2.46835 6.25322 2.56657C6.49436 2.18944 6.82655 1.87907 7.21919 1.66409C7.61182 1.44911 8.05225 1.33643 8.49988 1.33643C8.94752 1.33643 9.38795 1.44911 9.78058 1.66409C10.1732 1.87907 10.5054 2.18944 10.7466 2.56657C11.1853 2.46792 11.6419 2.48184 12.0739 2.60704C12.5058 2.73225 12.8991 2.96466 13.2171 3.28267C13.5351 3.60068 13.7675 3.99395 13.8927 4.4259C14.0179 4.85786 14.0319 5.31446 13.9332 5.75324C14.3104 5.99437 14.6207 6.32657 14.8357 6.7192C15.0507 7.11183 15.1634 7.55227 15.1634 7.9999C15.1634 8.44754 15.0507 8.88797 14.8357 9.2806C14.6207 9.67323 14.3104 10.0054 13.9332 10.2466C14.0314 10.6847 14.0175 11.1405 13.8926 11.5718C13.7677 12.003 13.5359 12.3958 13.2187 12.7136C12.9016 13.0314 12.5093 13.264 12.0783 13.3898C11.6473 13.5156 11.1915 13.5305 10.7532 13.4332C10.5124 13.8118 10.1799 14.1235 9.78663 14.3394C9.39333 14.5554 8.9519 14.6686 8.50322 14.6686C8.05453 14.6686 7.6131 14.5554 7.2198 14.3394C6.8265 14.1235 6.49404 13.8118 6.25322 13.4332C5.81511 13.5315 5.35929 13.5175 4.92802 13.3926C4.49676 13.2677 4.10401 13.0359 3.7862 12.7188C3.46838 12.4016 3.23579 12.0093 3.10999 11.5783C2.98419 11.1473 2.96925 10.6916 3.06655 10.2532C2.68652 10.0127 2.37349 9.68002 2.15658 9.28605C1.93967 8.89207 1.82593 8.44964 1.82593 7.9999C1.82593 7.55016 1.93967 7.10773 2.15658 6.71376C2.37349 6.31979 2.68652 5.98707 3.06655 5.74657Z"
                      stroke="#F9FAFB"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ t('community.detail.load') }}
                </template>
              </Button>
            </div>
          </div>
          <div
            class="rounded-[6px] border-solid border-[rgba(78,78,78,0.50)] border flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative text-[#F9FAFB] font-inter text-sm font-medium leading-5"
          >
            <div className="flex w-full text-gray-300 text-sm">
              <div className="w-[100px] bg-[#4E4E4E80] p-4 border-b border-[rgba(78,78,78,0.50)]">
                {{ t('community.detail.type') }}
              </div>
              <div className="flex-1 p-4 border-b text-sm border-[rgba(78,78,78,0.50)]">
                <span
                  :class="`${model?.type} inline-flex px-[10px] py-[2px] items-start gap-[10px] rounded-[9999px] relative overflow-hidden`"
                >
                  {{ model?.type }}
                </span>
              </div>
            </div>
            <div className="flex w-full">
              <div
                className="w-[100px] bg-[#4E4E4E80] p-4 text-sm  border-b border-[rgba(78,78,78,0.50)] whitespace-nowrap"
              >
                {{ t('community.detail.baseModel') }}
              </div>
              <div className="flex-1 p-4 border-b  border-[rgba(78,78,78,0.50)]">
                {{ currentVersion?.base_model }}
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-[100px] bg-[#4E4E4E80] p-4  border-b border-[rgba(78,78,78,0.50)]">
                {{ t('community.published') }}
              </div>
              <div className="flex-1 p-4 border-b border-[rgba(78,78,78,0.50)]">
                {{ currentVersion?.created_at }}
              </div>
            </div>
            <div
              v-if="model?.type === 'LoRA' || model?.type === 'Checkpoint'"
              className="flex w-full"
            >
              <div className="w-[100px] bg-[#4E4E4E80] p-4  border-b border-[rgba(78,78,78,0.50)]">
                {{ t('community.detail.reviews') }}
              </div>
              <div className="flex-1 p-4 border-b border-[rgba(78,78,78,0.50)]">
                <div class="flex items-center gap-2">
                  <vTooltips
                    :tips="
                      currentVersion?.review_result !== 'Unknown' &&
                      currentVersion?.review_state !== -1
                        ? t('community.detail.tooltips.modelType', [currentVersion?.review_result])
                        : t('community.detail.tooltips.unknownModelType')
                    "
                  >
                    <svg
                      v-if="currentVersion?.review_state === 1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.99992 1.33325L2.66659 3.33325V7.33325C2.66659 11.0666 4.91992 13.3999 7.99992 14.6666C11.0799 13.3999 13.3333 11.0666 13.3333 7.33325V3.33325L7.99992 1.33325Z"
                        stroke="#22C55E"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.33325 7.99992L7.33325 9.99992L10.6666 6.66659"
                        stroke="#22C55E"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.99992 1.33325L2.66659 3.33325V7.33325C2.66659 11.0666 4.91992 13.3999 7.99992 14.6666C11.0799 13.3999 13.3333 11.0666 13.3333 7.33325V3.33325L7.99992 1.33325Z"
                        stroke="#EF4444"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M10 6L6 10M6 6L10 10"
                        stroke="#EF4444"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </vTooltips>
                  <div v-if="currentVersion?.review_state === 1" class="flex items-center gap-1">
                    <span class="text-green-500">{{ t('community.detail.positive') }}</span>
                    <span class="text-gray-500">{{
                      currentVersion?.review_at
                        ? currentVersion?.review_at?.replace(/-/g, '/').split(' ')[0]
                        : ''
                    }}</span>
                  </div>
                  <span v-else class="text-red-500"> {{ t('community.detail.negative') }} </span>
                </div>
              </div>
            </div>

            <div className="flex w-full">
              <div className="w-[100px] bg-[#4E4E4E80] p-4  border-b border-[rgba(78,78,78,0.50)]">
                {{ t('community.detail.hash') }}
              </div>
              <div
                className="flex-1 p-4 border-b border-[rgba(78,78,78,0.50)] flex items-center gap-2"
              >
                <span>
                  {{ currentVersion?.sign ? sliceString(currentVersion?.sign, 15) : '' }}
                </span>
                <vTooltips :tips="t('community.detail.copy')">
                  <svg
                    v-if="currentVersion?.sign"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    class="cursor-pointer hover:opacity-80"
                    @click="handleCopy(currentVersion?.sign || '')"
                  >
                    <g clip-path="url(#clip0_315_3710)">
                      <path
                        d="M2.66659 10.6666C1.93325 10.6666 1.33325 10.0666 1.33325 9.33325V2.66659C1.33325 1.93325 1.93325 1.33325 2.66659 1.33325H9.33325C10.0666 1.33325 10.6666 1.93325 10.6666 2.66659V13.3333C10.6666 14.0696 10.0696 14.6666 9.33333 14.6666H6.66658C5.93021 14.6666 5.33325 14.0696 5.33325 13.3333V6.66658C5.33325 5.93021 5.93021 5.33325 6.66658 5.33325Z"
                        stroke="#9CA3AF"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_315_3710">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </vTooltips>
              </div>
            </div>
            <div className="flex w-full">
              <div
                className="w-[100px] bg-[#4E4E4E80] p-4 text-gray-300   border-b border-[rgba(78,78,78,0.50)]"
              >
                {{ t('community.detail.stats') }}
              </div>
              <div className="flex-1 p-4 border-b border-[rgba(78,78,78,0.50)] flex flex-row gap-2">
                <div
                  v-if="model?.type !== 'Workflow'"
                  class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
                >
                  <vTooltips :tips="t('community.modelCard.tooltips.used')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3.33325 2L12.6666 8L3.33325 14V2Z"
                        stroke="#F9FAFB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </vTooltips>
                  <div
                    class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
                  >
                    {{ formatNumber(currentVersion?.counter?.used_count) }}
                  </div>
                </div>
                <div
                  class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
                >
                  <vTooltips :tips="t('community.modelCard.tooltips.forked')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.99992 1.33325L10.0599 5.50659L14.6666 6.17992L11.3333 9.42659L12.1199 14.0133L7.99992 11.8466L3.87992 14.0133L4.66659 9.42659L1.33325 6.17992L5.93992 5.50659L7.99992 1.33325Z"
                        stroke="#F9FAFB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </vTooltips>
                  <div
                    class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
                  >
                    {{ formatNumber(currentVersion?.counter?.forked_count) }}
                  </div>
                </div>
                <div
                  class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
                >
                  <vTooltips :tips="t('community.modelCard.tooltips.liked')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clip-path="url(#clip0_315_3742)">
                        <path
                          d="M4.66659 6.66658V14.6666M9.99992 3.91992L9.33325 6.66658H13.2199C13.4269 6.66658 13.6311 6.71478 13.8162 6.80735C14.0013 6.89992 14.1624 7.03432 14.2866 7.19992C14.4108 7.36551 14.4947 7.55775 14.5317 7.7614C14.5688 7.96506 14.5579 8.17454 14.4999 8.37325L12.9466 13.7066C12.8658 13.9835 12.6974 14.2268 12.4666 14.3999C12.2358 14.573 11.9551 14.6666 11.6666 14.6666H2.66659C2.31296 14.6666 1.97382 14.5261 1.72378 14.2761C1.47373 14.026 1.33325 13.6869 1.33325 13.3333V7.99992C1.33325 7.6463 1.47373 7.30716 1.72378 7.05711C1.97382 6.80706 2.31296 6.66658 2.66659 6.66658H4.50659C4.75464 6.66645 4.99774 6.59713 5.20856 6.4664C5.41937 6.33567 5.58953 6.14873 5.69992 5.92659L7.99992 1.33325C8.3143 1.33715 8.62374 1.41203 8.90512 1.55232C9.1865 1.6926 9.43254 1.89466 9.62486 2.14339C9.81717 2.39212 9.9508 2.68109 10.0157 2.98872C10.0807 3.29635 10.0753 3.61468 9.99992 3.91992Z"
                          stroke="#F9FAFB"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_315_3742">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </vTooltips>
                  <div
                    class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
                  >
                    {{ formatNumber(currentVersion?.counter?.liked_count) }}
                  </div>
                </div>
                <div
                  v-if="model?.type === 'Workflow'"
                  class="bg-[#6D28D933] rounded-radius-rounded-xl pr-1.5 pl-1.5 flex flex-row gap-1 items-center justify-center shrink-0 min-w-[40px] relative overflow-hidden"
                >
                  <vTooltips :tips="t('community.modelCard.tooltips.downloaded')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                        stroke="#F9FAFB"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </vTooltips>
                  <div
                    class="text-text-text-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative flex-1"
                  >
                    {{ formatNumber(currentVersion?.counter?.downloaded_count) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="rounded-md border-solid border-[#4e4e4e] border flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative"
          >
            <div
              class="bg-[#424242] rounded-md flex items-center justify-start self-stretch shrink-0 relative h-[44px] pl-2"
            >
              {{ t('community.detail.file') }}
            </div>
            <div
              class="flex px-[8px] py-4 items-center self-stretch text-[#F9FAFB] font-inter text-xs font-medium leading-5"
            >
              {{ currentVersion?.file_name ? sliceString(currentVersion?.file_name, 20) : '' }} ({{
                formatSize(currentVersion?.file_size)
              }})
              <span
                v-if="model?.type === 'Workflow'"
                class="cursor-pointer ml-2 hover:opacity-80"
                @click="handleDownloadWorkFlow"
              >
                <vTooltips :tips="t('community.detail.download')">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                      stroke="#F9FAFB"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </vTooltips>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="min-h-[60vh]">
      <LoadingOverlay v-if="isLoading" />
    </div>
  </v-dialog>

  <!-- 复制失败弹框 -->
  <v-dialog
    v-model:open="showCopyDialog"
    class="px-6 overflow-visible pb-6 z-[10002] max-w-[500px] bg-[#353535]"
    layout-class="z-[10001]"
    content-class="custom-scrollbar max-h-[80vh] overflow-y-auto w-full rounded-tl-lg rounded-tr-lg custom-shadow"
  >
    <div class="p-6 flex flex-col gap-4 items-start justify-start relative">
      <div class="flex flex-col gap-4 items-start justify-start self-stretch shrink-0 relative">
        <div class="flex flex-row gap-2 items-center justify-start self-stretch shrink-0 relative">
          <div
            class="text-text-text-foreground text-left font-['Inter-SemiBold',_sans-serif] text-lg leading-[18px] font-semibold relative"
            style="letter-spacing: -0.025em"
          >
            {{ t('community.detail.manualCopy') }}
          </div>
        </div>
        <div class="flex flex-col gap-2 items-start justify-start self-stretch shrink-0 relative">
          <div
            class="text-text-text-muted-foreground text-left font-['Inter-Regular',_sans-serif] text-sm leading-5 font-normal relative"
          >
            {{ t('community.detail.manualCopyDesc') }}
          </div>
          <div class="w-full">
            <input
              :value="copyText"
              readonly
              class="w-full px-3 py-2 bg-[#424242] border border-[#6b7280] rounded-md text-[#F9FAFB] text-sm font-mono focus:outline-none focus:border-[#6D28D9]"
              @focus="(event) => (event.target as HTMLInputElement)?.select()"
            />
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
  .md-editor-dark {
    @apply bg-[#353535] text-[#F9FAFB] text-sm;
  }

  .md-editor-dark {
    @apply bg-[#353535] text-[#F9FAFB];
  }

  :deep(.md-editor-preview-wrapper) {
    @apply text-[#F9FAFB];
  }

  :deep(.md-editor-preview) {
    @apply text-[#F9FAFB];

    p,
    li,
    table {
      @apply text-[#F9FAFB];
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      @apply text-[#F9FAFB];
    }

    code {
      @apply text-[#F9FAFB] bg-[#424242];
    }

    blockquote {
      @apply text-[#F9FAFB] border-l-4 border-[#6b7280];
    }
  }

  :deep([role='tablist']) {
    display: inline-flex;
    min-width: min-content;
  }

  :deep([data-radix-scroll-area-viewport]) {
    width: 100%;
  }

  .Checkpoint {
    background: rgba(109, 40, 217, 0.4);
  }

  .LoRA {
    background: rgba(244, 63, 94, 0.4);
  }

  .Controlnet {
    background: rgba(255, 255, 255, 0.4);
  }

  .VAE {
    background: rgba(234, 179, 8, 0.4);
  }

  .Upscaler {
    background: rgba(69, 244, 63, 0.4);
  }

  .Embeddings {
    background: rgba(0, 26, 255, 0.4);
  }

  .Workflow {
    background: rgba(0, 178, 255, 0.4);
  }

  :deep(.md-editor-preview h1),
  :deep(.md-editor-preview h2) {
    line-height: 1.2em;
  }

  .newTag {
    background: #c60003;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }

  .hotTag {
    background: #c60003;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }

  .model-tag {
    background: rgba(105, 109, 118, 0.8);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    padding: 0px 8px;
    color: white;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    height: 20px;
  }
</style>
