<script setup lang="ts">
  import { defineProps, ref } from 'vue'
  const props = defineProps<{
    data: { name: string, value?: string, active?: string, fn: () => void }[]
  }>()

  const itemList = ref(props.data)

  const emit = defineEmits(['update:modelValue'])

  const check = (e: {name: string, value?: string, active?: string, fn: () => void}) => {
    props.data.forEach((el) => {
      el.active = ''
    })
    e.active = 'active'
    e.fn()
    if (e.value) {
      emit('update:modelValue', e.value)
    } else {
      emit('update:modelValue', e.name)
    }
  }
</script>

<template>
  <ul class="v-radio">
    <li v-for="(e, i) in itemList" :key="i" :class="{'active': e.active}" @click="check(e)">{{ e.name }}</li>
  </ul>
</template>

<style scoped lang="less">
.v-radio{
  padding: 0;
  margin: 0;
  list-style: none;
  li{
    margin: 0;
    display: flex;
    cursor: pointer;
    padding: 4px 10px;
    align-items: center;
    &::before{
      content: '';
      width: 1rem;
      height: 1rem;
    }
  }
  .active{
    background-color: rgba(109, 40, 217, 1);
    &::before{
      content: '√';
      color: #FFF;
      font-size: .6rem;
    }
  }
}
</style>