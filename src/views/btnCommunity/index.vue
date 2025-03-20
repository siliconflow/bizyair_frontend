<template>
  <div
    class="flex items-center hover:bg-[#4A238E] cursor-pointer relative px-3 rounded-sm"
    @click="handleMenuClick"
  >
    <span class="mr-1 h-4 w-4">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.77588 3V11C8.77588 11.3956 8.89318 11.7822 9.11294 12.1111C9.3327 12.44 9.64506 12.6964 10.0105 12.8478C10.376 12.9991 10.7781 13.0387 11.1661 12.9616C11.554 12.8844 11.9104 12.6939 12.1901 12.4142C12.4698 12.1345 12.6603 11.7781 12.7375 11.3902C12.8146 11.0022 12.775 10.6001 12.6236 10.2346C12.4723 9.86918 12.2159 9.55682 11.887 9.33706C11.5581 9.1173 11.1714 9 10.7759 9H2.77588C2.38032 9 1.99364 9.1173 1.66474 9.33706C1.33584 9.55682 1.0795 9.86918 0.928121 10.2346C0.776745 10.6001 0.737139 11.0022 0.814309 11.3902C0.89148 11.7781 1.08196 12.1345 1.36167 12.4142C1.64137 12.6939 1.99774 12.8844 2.3857 12.9616C2.77366 13.0387 3.17579 12.9991 3.54125 12.8478C3.9067 12.6964 4.21906 12.44 4.43882 12.1111C4.65858 11.7822 4.77588 11.3956 4.77588 11V3C4.77588 2.60444 4.65858 2.21776 4.43882 1.88886C4.21906 1.55996 3.9067 1.30362 3.54125 1.15224C3.17579 1.00087 2.77366 0.96126 2.3857 1.03843C1.99774 1.1156 1.64137 1.30608 1.36167 1.58579C1.08196 1.86549 0.89148 2.22186 0.814309 2.60982C0.737139 2.99778 0.776745 3.39992 0.928121 3.76537C1.0795 4.13082 1.33584 4.44318 1.66474 4.66294C1.99364 4.8827 2.38032 5 2.77588 5H10.7759C11.1714 5 11.5581 4.8827 11.887 4.66294C12.2159 4.44318 12.4723 4.13082 12.6236 3.76537C12.775 3.39992 12.8146 2.99778 12.7375 2.60982C12.6603 2.22186 12.4698 1.86549 12.1901 1.58579C11.9104 1.30608 11.554 1.1156 11.1661 1.03843C10.7781 0.96126 10.376 1.00087 10.0105 1.15224C9.64506 1.30362 9.3327 1.55996 9.11294 1.88886C8.89318 2.21776 8.77588 2.60444 8.77588 3Z"
          stroke="#F9FAFB"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="block leading leading-8 text-sm">Community</span>
  </div>
  <v-dialog
    v-model:open="communityStore.showDialog"
    class="px-0 overflow-hidden pb-0 z-9000 max-w-[90%] bg-[#353535]"
    layout-class="z-9000"
    content-class=" max-h-[80vh]   w-full rounded-tl-lg rounded-tr-lg custom-shadow"
  >
    <Community />
  </v-dialog>
</template>
<script setup lang="ts">
  import vDialog from '@/components/modules/vDialog.vue'
  import Community from '@/components/community/Index.vue'
  import { useCommunityStore } from '@/stores/communityStore'
  const communityStore = useCommunityStore()

  const handleMenuClick = () => {
    communityStore.showDialog = true
  }
</script>
<style scoped></style>
