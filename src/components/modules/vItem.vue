<script setup lang="ts">
defineProps({
  label: String,
  required: Boolean,
})
</script>

<template>
  <div class="pt-3">
    <p class="text-sm">{{ label }}<span v-if="required">*</span></p>
    <div class="mt-2">
      <slot />
    </div>
  </div>
</template>
