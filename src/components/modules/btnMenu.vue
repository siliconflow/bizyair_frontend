<template>
  <n-dropdown
    :show-arrow="true" 
    trigger="hover" 
    key-field="value"
    label-field="name"
    :options="objectToArray(showCases)" 
    @select="toDo">
    <div class="dropdown-container">
      <span class="slot-container">
        <slot />
      </span>
      <span class="button-text">{{ buttonText }}</span>
      <img
        v-if="isJson"
        class="json-icon"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAACbSURBVFiF7ZYhEsIwFERfOpFIBAJZgeQoCG7CcThKy2lqEByhM4tIDSBIQyiIfS4z+X9fVBYqIilK2tTcOSd8J2lQopMUlxY465FjzlxT0aF9Oq+WFijCAhawgAUsYIGfC0RIZQI48fqlzmFfJDA1lw7YfhBeTAOsvxQ+ZgmEEK7ApXL4DehzLgZIbRY4kFmj3jAC/fQwY4z5f+5uET1JRps4hQAAAABJRU5ErkJggg=="
        alt=""
      />
    </div>
  </n-dropdown>
</template>
<script setup lang="ts">
  import { NDropdown } from 'naive-ui'
  import { ref, watch } from 'vue'
  import { objectToArray } from '@/utils/tool'
  const props = defineProps({
    show_cases: Object,
    buttonText: String,
    icon: String,
    isJson: Boolean
  })
  const showCases = ref(props.show_cases)
  // const comfyUIApp: any = inject('comfyUIApp')

  const toDo = async (e: any) => {
    
    if (typeof e === 'function') {
      e()
      return
    }
    if (e.startsWith('https://')) {
      window.open(e, '_blank')
    } else {
      console.log('e', e)
    }
  }
  // const objectToArrayOptions = (e: any) => {
  //   const res = []
  //   for (const key in e) {
  //     if (typeof e[key] === 'string' || typeof e[key] === 'function') {
  //       res.push({ label: key, key: {value: e[key]} })
  //     } else {
  //       res.push({ label: key, key: objectToArray(e[key]) })
  //     }
  //   }
  //   return res
  // }
  watch(
    () => props.show_cases,
    val => {
      if (val) {
        showCases.value = val
      }
    }
  )
</script>
<style scoped>
.dropdown-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 0 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.dropdown-container:hover {
  background-color: #4A238E;
}

.slot-container {
  margin-right: 4px;
}

.button-text {
  display: block;
  line-height: 32px;
  font-size: 14px;
}

.json-icon {
  position: absolute;
  right: 4px;
  bottom: 0;
  width: 12px;
  height: 12px;
}
</style>