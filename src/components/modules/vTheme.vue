<script setup lang="ts">
  import { NConfigProvider, darkTheme } from 'naive-ui'
  const myDarkTheme = { ...darkTheme }
  myDarkTheme.common.primaryColor = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorSuppl = 'rgba(109, 40, 217, 1)'
  myDarkTheme.common.primaryColorHover = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.inputColor = '#000'
  myDarkTheme.common.inputColorDisabled = 'rgba(109, 40, 217, .2)'
  myDarkTheme.common.primaryColorPressed = 'rgba(109, 40, 217, .8)'
  myDarkTheme.common.baseColor = '#FFF'
</script>

<template>
  <n-config-provider :theme="myDarkTheme">
    <slot />
  </n-config-provider>
</template>

<style scoped lang="less"></style>
