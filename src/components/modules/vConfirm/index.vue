<script setup lang="ts">
  import { defineProps, defineEmits, ref } from 'vue'
  import { NModal } from 'naive-ui'

  const showModal = ref(true)
  defineProps({
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    continueText: {
      type: String,
      default: 'Continue'
    },
    title: {
      type: String,
      default: 'Are you absolutely sure?'
    },
    content: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['continueClick', 'cancelClick'])
  const submitCallback = () => {
    emit('continueClick')
  }
  const cancelCallback = () => {
    emit('cancelClick')
  }
</script>

<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="title"
    :content="content"
    :positive-text="continueText"
    :negative-text="cancelText"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
  />
</template>
