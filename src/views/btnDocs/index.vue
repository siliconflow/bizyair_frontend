<template>
  <div class="dropdown-container" @click="openDocs">
    <span class="slot-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path
          fill="#fff"
          d="M8 13h8v-2H8zm0 3h8v-2H8zm0 3h5v-2H8zm-2 3q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h8l6 6v12q0 .825-.587 1.413T18 22zm7-13V4H6v16h12V9zM6 4v5zv16z"
        />
      </svg>
    </span>
    <span class="button-text">{{ $t('buttons.docs') }}</span>
  </div>
  
</template>
<script setup lang="ts">
  const openDocs = () => {
    window.open('https://docs.bizyair.cn/', '_blank')
  }
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
    background-color: #4a238e;
  }

  .slot-container {
    margin-right: 4px;
    height: 16px;
  }

  .button-text {
    display: block;
    line-height: 32px;
    font-size: 14px;
  }
</style>
