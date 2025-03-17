<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  interface MenuItem {
    id: number
    title: string
    subtitle: string
    path: string
    icon?: string
  }

  defineProps<{
    currentPath: string
  }>()

  const { t } = useI18n()

  const menuItems = ref<MenuItem[]>([
    {
      id: 1,
      title: t('community.quickStart.title'),
      subtitle: t('community.quickStart.subtitle'),
      path: '/quick-start',
      icon: `M16.0002 19.9999L12.0002 15.9999M16.0002 19.9999C17.8626 19.2916 19.6493 18.3982 21.3335 17.3333M16.0002 19.9999V26.6666C16.0002 26.6666 20.0402 25.9333 21.3335 23.9999C22.7735 21.8399 21.3335 17.3333 21.3335 17.3333M12.0002 15.9999C12.7097 14.1592 13.6031 12.3947 14.6668 10.7333C16.2204 8.24924 18.3837 6.20399 20.9508 4.79205C23.518 3.3801 26.4037 2.64842 29.3335 2.66659C29.3335 6.29326 28.2935 12.6666 21.3335 17.3333M12.0002 15.9999H5.3335C5.3335 15.9999 6.06683 11.9599 8.00016 10.6666C10.1602 9.22659 14.6668 10.6666 14.6668 10.6666M6.00016 21.9999C4.00016 23.6799 3.3335 28.6666 3.3335 28.6666C3.3335 28.6666 8.32016 27.9999 10.0002 25.9999C10.9468 24.8799 10.9335 23.1599 9.88016 22.1199C9.3619 21.6253 8.67922 21.3394 7.96313 21.3173C7.24704 21.2951 6.548 21.5382 6.00016 21.9999Z`
    },
    {
      id: 2,
      title: t('community.workflows.title'),
      subtitle: t('community.workflows.subtitle'),
      path: '/workflows',
      icon: `M21.3332 28V25.3333C21.3332 23.9188 20.7713 22.5623 19.7711 21.5621C18.7709 20.5619 17.4143 20 15.9998 20H7.99984C6.58535 20 5.22879 20.5619 4.2286 21.5621C3.22841 22.5623 2.6665 23.9188 2.6665 25.3333V28M29.3332 28V25.3333C29.3323 24.1516 28.939 23.0037 28.215 22.0698C27.491 21.1358 26.4773 20.4688 25.3332 20.1733M21.3332 4.17333C22.4804 4.46707 23.4972 5.13427 24.2234 6.06975C24.9495 7.00523 25.3436 8.15577 25.3436 9.34C25.3436 10.5242 24.9495 11.6748 24.2234 12.6103C23.4972 13.5457 22.4804 14.2129 21.3332 14.5067M17.3332 9.33333C17.3332 12.2789 14.9454 14.6667 11.9998 14.6667C9.05432 14.6667 6.6665 12.2789 6.6665 9.33333C6.6665 6.38781 9.05432 4 11.9998 4C14.9454 4 17.3332 6.38781 17.3332 9.33333Z`
    },
    {
      id: 3,
      title: t('community.models.title'),
      subtitle: t('community.models.subtitle'),
      path: '/models',
      icon: `M22 12.5334L10.0667 5.65337M4.38667 9.33337L16 16M16 16L27.6133 9.33337M16 16V29.3334M28 21.3334V10.6667C27.9995 10.1991 27.8761 9.73978 27.6421 9.33492C27.408 8.93005 27.0717 8.59385 26.6667 8.36003L17.3333 3.0267C16.9279 2.79265 16.4681 2.66943 16 2.66943C15.5319 2.66943 15.0721 2.79265 14.6667 3.0267L5.33333 8.36003C4.92835 8.59385 4.59197 8.93005 4.35795 9.33492C4.12392 9.73978 4.00048 10.1991 4 10.6667V21.3334C4.00048 21.801 4.12392 22.2603 4.35795 22.6651C4.59197 23.07 4.92835 23.4062 5.33333 23.64L14.6667 28.9734C15.0721 29.2074 15.5319 29.3306 16 29.3306C16.4681 29.3306 16.9279 29.2074 17.3333 28.9734L26.6667 23.64C27.0717 23.4062 27.408 23.07 27.6421 22.6651C27.8761 22.2603 27.9995 21.801 28 21.3334Z`
    }
  ])

  const emit = defineEmits(['menu-click'])

  const handleMenuClick = (item: MenuItem) => {
    emit('menu-click', item)
  }
</script>

<template>
  <div class="w-64 bg-[#353535] h-full fixed left-0 top-0 border-r border-[#6E6E6E80]">
    <div class="flex flex-col p-2 pl-8 pr-2 h-full">
      <div class="flex-1">
        <h3 class="pt-2 pb-4 text-[#F9FAFB] font-['Inter'] text-[14px] font-medium leading-[14px]">
          <!-- {{ t('community.explore') }} -->
        </h3>
        <div class="space-y-4">
          <div
            v-for="item in menuItems"
            :key="item.id"
            :class="[
              'flex items-center space-x-3 p-3 w-52 h-14 rounded-lg cursor-pointer bg-[#222] text-gray-300',
              currentPath === item.path
                ? 'bg-[#6D28D9] text-white'
                : 'hover:bg-gray-800 hover:text-white'
            ]"
            @click="handleMenuClick(item)"
          >
            <div class="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  :d="item.icon"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="flex-1 flex flex-col">
              <span>{{ item.title }}</span>
              <div class="text-xs text-[#9CA3AF]">
                {{ item.subtitle }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="mb-3 w-52 h-[1px] bg-[#6E6E6E80]"></div>
        <!-- <div class="mb-4">
          <h3 class="text-[#F9FAFB] font-['Inter'] text-[14px] font-medium leading-[14px]">
            {{ t('community.mine.title') }}
          </h3>
        </div> -->
        <div
          :class="[
            'flex items-center space-x-3 p-3 w-52 h-14 rounded-lg cursor-pointer bg-[#222] text-gray-300 hover:bg-gray-800 hover:text-white',
            currentPath === '/my-models' ? 'bg-[#6D28D9] text-white' : ''
          ]"
          @click="
            handleMenuClick({
              id: 4,
              title: t('community.mine.contents.title'),
              subtitle: t('community.mine.contents.subtitle'),
              path: '/my-models'
            })
          "
        >
          <div class="w-6 h-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M14.6665 26.6667H5.33317C4.62593 26.6667 3.94765 26.3857 3.44755 25.8856C2.94746 25.3855 2.6665 24.7072 2.6665 24V6.66667C2.6665 5.2 3.8665 4 5.33317 4H10.5732C11.0124 4.00227 11.4442 4.113 11.8304 4.32235C12.2165 4.53169 12.5449 4.83317 12.7865 5.2L13.8798 6.8C14.1214 7.16683 14.4498 7.46831 14.836 7.67765C15.2221 7.887 15.654 7.99773 16.0932 8H26.6665C27.3737 8 28.052 8.28095 28.5521 8.78105C29.0522 9.28115 29.3332 9.95942 29.3332 10.6667V12.6667M28.3865 18.2667C27.9322 17.8146 27.354 17.5074 26.725 17.384C26.0961 17.2606 25.4447 17.3265 24.8532 17.5733C24.4532 17.7333 24.0932 17.9733 23.7865 18.28L23.3332 18.7333L22.8665 18.28C22.4137 17.8257 21.8361 17.516 21.2071 17.3902C20.5781 17.2644 19.9259 17.3281 19.3332 17.5733C18.9332 17.7333 18.5865 17.9733 18.2798 18.28C17.0132 19.5333 16.9465 21.6533 18.5465 23.2667L23.3332 28L28.1332 23.2667C29.7332 21.6533 29.6532 19.5333 28.3865 18.28V18.2667Z"
                stroke="#F9FAFB"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="flex-1 flex flex-col">
            <span>{{ t('community.mine.contents.title') }}</span>
            <div class="text-xs text-[#9CA3AF]">{{ t('community.mine.contents.subtitle') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
