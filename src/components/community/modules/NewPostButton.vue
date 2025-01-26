<script setup lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
  import { Button } from '@/components/ui/button'
  import { ref } from 'vue'

  defineOptions({
    name: 'NewPostButton'
  })

  interface NewPostButtonProps {
    disabled?: boolean
  }
  const downloadOpen = ref(false)

  const props = withDefaults(defineProps<NewPostButtonProps>(), {
    disabled: false
  })

  const emit = defineEmits<{
    'new-model': []
    'new-workflow': []
  }>()

  const handleDownload = () => {
    downloadOpen.value = !downloadOpen.value
  }

  const handleNewModel = () => {
    if (props.disabled) return
    downloadOpen.value = false
    emit('new-model')
  }

  const handleNewWorkflow = () => {
    if (props.disabled) return
    downloadOpen.value = false
    emit('new-workflow')
  }
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="text-white text-base font-medium">My Posts</div>
    <Popover class="bg-[#353535]" :open="downloadOpen" @update:open="handleDownload">
      <PopoverTrigger class="bg-transparent" :disabled="disabled">
        <Button
          class="bg-[#7C3AED] hover:bg-[#7C3AED]/90 cursor-pointer flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium"
          :class="{ 'opacity-50 cursor-not-allowed': disabled }"
          :disabled="disabled"
        >
          <span class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Post
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        class="w-40 p-1 bg-[#0e0e0e] border border-[#4e4e4e] z-11000 rounded-lg shadow-lg"
      >
        <Command>
          <CommandList>
            <CommandGroup class="flex flex-col gap-1">
              <CommandItem
                value="Model"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer block w-30',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  { 'opacity-50 cursor-not-allowed': disabled }
                ]"
                @click="handleNewModel"
              >
                <span class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    />
                  </svg>
                  Model
                </span>
              </CommandItem>
              <CommandItem
                value="Workflow"
                :class="[
                  'px-2 py-1.5 text-[#F9FAFB] cursor-pointer block w-30',
                  '[&:hover]:!bg-[#8B5CF6] [&:hover]:!text-[#F9FAFB]',
                  { 'opacity-50 cursor-not-allowed': disabled }
                ]"
                @click="handleNewWorkflow"
              >
                <span class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M2 13.381h20M8.66 19.05V22m6.68-2.95V22m-8.67-9.571h12.65m-12.65 0c-.76 0-1.375-.616-1.375-1.376m1.375 1.376L9.305 9.057M18.66 12.429c.759 0 1.375-.616 1.375-1.376m-1.375 1.376L17.016 9.057m-7.711 0h8.39m-8.39 0c-.759 0-1.375-.616-1.375-1.376v-.19c0-.76.616-1.376 1.375-1.376h8.39c.76 0 1.375.616 1.375 1.376v.19c0 .76-.616 1.376-1.375 1.376m-9.765 2.996v.19c0 .76.616 1.376 1.375 1.376m8.39-1.566v.19c0 .76-.616 1.376-1.375 1.376"
                    />
                  </svg>
                  Workflow
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>

<style scoped>
  .popover-content {
    transform-origin: var(--radix-popover-content-transform-origin);
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
