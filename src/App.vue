<template>
  <vTheme>
    <n-message-provider>
      <n-notification-provider>
        <div id="bizyair-menu-box" :class="['bizyair-menu-box', { 'is-mini-box': isMini }]">
          <div class="bizyair-bar">
            <h1>
              <n-tooltip v-if="isMini" trigger="hover">
                <template #trigger>
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQwSURBVHic7ZwxiFxVFIb/KyuskCLFFtNpsUIKiwgWEVKslREiWERIIOAKlhYRUgRstlC0EEQsRBKIjaQWi11IkYiCSBZslBVmIEKEWVBQ2IUtZuGzeG/g+Zz39t1z78zszL0fLAvLeeec+efed887796VMplMJpPJZDKZTCaTSQsX6gAgRiKR2Jc0kPSDpB3n3HfTDrhsAtYZSPpA0tfOueNpBFh2AcfsSrrmnBvEdpyKgJJ0KOlN59xOTKcpCShJx5JejyliagJKxUh8MdZ0fiqGkwXjjKR7wEoMZykKKEkvSboew1GKU3jMwDn3fKiTVEegJK0DG6FOUhZQkl4NdZC6gBdCHcxSwENJr7kWJD0t6avSfl/SM232E669VsbpyrmYH9AE3blygp8e8GPF/qYxn5seOc1/AeyY5wg40+LjHDCs2P8NnDXksgr0ZyngrKbwL865iVMLuCjpgaRe5c+fOef+McS5JWndw37fECMuHb/o2w3XXgQOarZHwJohj/XyWh8ehH7+WY3AX+t/AM5L2lbxaFXlS+fcX4YYX0ha9bzmJ0OcuHT8pi/Vrlnnv/e86ujrNcVqyeGq58gbsxFNCCsdE32uYr8G7DXY3THEPws8MYjXjyqElQ6JHlVsV4D7TXbYRt+nBvEANqMKYaVDov2K7VaL3ceG2C9QlEi+PCJSOyuYDsneL+0utdhY677vDeIdAD6lznTpkPBdYIP/lytVvJ86gOsG8UbUFrS50yHpIe3TbAh4lR8UC8ekVbyNg1MnnuT1LNzEpiGm78LxiNM0basEireH580cv4WjD2z6xvBh3ivRe4YdA5+rOe99Sb+peMLYcc49DMitE/NsqH7j+34WuCpp4wSzFUmUP6cf49Q9ovJ00jHOKvDYM04feGuaUzgYo4BbhjjvG2PBki0ij/EvW3q015HbHeIuTRnzhiHG3RZ/VygK9S4sZCFdZdvg/zzNZctWabPpkcPCPcqNObIkTnP3ZodyccD//rhQzYQxtwy+mxoQT6i0/YHbngLCArWzAH7G8I2X19U5AC7U7CxdmYVpqI4o3n/4+p3UbRkBlyfY/mkQEBakpb9l8LnC5Pe770ywXTOKB/BRFBFCOCHBPTxrvtLnpFX1RoNt1xJmEsGvNYNpSW5E7V7V0V999I2axCvtbwQIOAz79BFoSe4To7/q6Btx8p6aewECzr/h0JKb984nitE37jQPKbZ9tNn3sC8gUQScZjH5LfCuiv5cVy6r2CPzu4o9zH8AzzbYrkm6U/62Erw3JuU90pL00Dn3SoiD1HeoBu+NSV3A4BNLKU/hfMwhkA9jOEl1BO5KejnGGeIUBcyHDQM4VnFmONrB65QEPFTks8JSOgLuqpi2UcWTll/AgaS3VSwY0f9fgjT/vTGxmfnemEwmk8lkMplMJpPJZFLjXzMoB90iULCqAAAAAElFTkSuQmCC"
                    alt=""
                    @mousedown="toNormal"
                  />
                </template>
                {{ $t('app.restore') }}
              </n-tooltip>
              <img
                v-else
                @mousedown.stop.prevent.capture="toMini"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAQwSURBVHic7ZwxiFxVFIb/KyuskCLFFtNpsUIKiwgWEVKslREiWERIIOAKlhYRUgRstlC0EEQsRBKIjaQWi11IkYiCSBZslBVmIEKEWVBQ2IUtZuGzeG/g+Zz39t1z78zszL0fLAvLeeec+efed887796VMplMJpPJZDKZTCaTSQsX6gAgRiKR2Jc0kPSDpB3n3HfTDrhsAtYZSPpA0tfOueNpBFh2AcfsSrrmnBvEdpyKgJJ0KOlN59xOTKcpCShJx5JejyliagJKxUh8MdZ0fiqGkwXjjKR7wEoMZykKKEkvSboew1GKU3jMwDn3fKiTVEegJK0DG6FOUhZQkl4NdZC6gBdCHcxSwENJr7kWJD0t6avSfl/SM232E669VsbpyrmYH9AE3blygp8e8GPF/qYxn5seOc1/AeyY5wg40+LjHDCs2P8NnDXksgr0ZyngrKbwL865iVMLuCjpgaRe5c+fOef+McS5JWndw37fECMuHb/o2w3XXgQOarZHwJohj/XyWh8ehH7+WY3AX+t/AM5L2lbxaFXlS+fcX4YYX0ha9bzmJ0OcuHT8pi/Vrlnnv/e86ujrNcVqyeGq58gbsxFNCCsdE32uYr8G7DXY3THEPws8MYjXjyqElQ6JHlVsV4D7TXbYRt+nBvEANqMKYaVDov2K7VaL3ceG2C9QlEi+PCJSOyuYDsneL+0utdhY677vDeIdAD6lznTpkPBdYIP/lytVvJ86gOsG8UbUFrS50yHpIe3TbAh4lR8UC8ekVbyNg1MnnuT1LNzEpiGm78LxiNM0basEireH580cv4WjD2z6xvBh3ivRe4YdA5+rOe99Sb+peMLYcc49DMitE/NsqH7j+34WuCpp4wSzFUmUP6cf49Q9ovJ00jHOKvDYM04feGuaUzgYo4BbhjjvG2PBki0ij/EvW3q015HbHeIuTRnzhiHG3RZ/VygK9S4sZCFdZdvg/zzNZctWabPpkcPCPcqNObIkTnP3ZodyccD//rhQzYQxtwy+mxoQT6i0/YHbngLCArWzAH7G8I2X19U5AC7U7CxdmYVpqI4o3n/4+p3UbRkBlyfY/mkQEBakpb9l8LnC5Pe770ywXTOKB/BRFBFCOCHBPTxrvtLnpFX1RoNt1xJmEsGvNYNpSW5E7V7V0V999I2axCvtbwQIOAz79BFoSe4To7/q6Btx8p6aewECzr/h0JKb984nitE37jQPKbZ9tNn3sC8gUQScZjH5LfCuiv5cVy6r2CPzu4o9zH8AzzbYrkm6U/62Erw3JuU90pL00Dn3SoiD1HeoBu+NSV3A4BNLKU/hfMwhkA9jOEl1BO5KejnGGeIUBcyHDQM4VnFmONrB65QEPFTks8JSOgLuqpi2UcWTll/AgaS3VSwY0f9fgjT/vTGxmfnemEwmk8lkMplMJpPJZFLjXzMoB90iULCqAAAAAElFTkSuQmCC"
                alt=""
              />
              <span>{{ $t('app.title') }}</span>
            </h1>
            <div class="handle">
              <div
                :class="['share-input-box', { 'share-input-box-has-val': shareCode }]"
                @mouseover="() => (shareInput as any).focus()"
              >
                <strong class="share-input">
                  <n-input
                    size="tiny"
                    v-model:value="shareCode"
                    class="input"
                    ref="shareInput"
                    :placeholder="$t('app.shareCode.placeholder')"
                  >
                    <template #suffix>
                      <span class="msg" @click="runShareCode">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <g
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            color="currentColor"
                          >
                            <path
                              d="M12.987 2h.273c3.267 0 4.9 0 6.035.798c.325.228.614.5.857.805c.85 1.066.85 2.6.85 5.67v2.545c0 2.963 0 4.445-.47 5.628c-.756 1.903-2.353 3.403-4.378 4.113c-1.259.441-2.836.441-5.99.441c-1.802 0-2.703 0-3.423-.252c-1.157-.406-2.07-1.263-2.5-2.35c-.27-.676-.27-1.523-.27-3.216V12"
                            />
                            <path
                              d="M21.001 12a3.333 3.333 0 0 1-3.333 3.333c-.666 0-1.451-.116-2.098.057a1.67 1.67 0 0 0-1.179 1.179c-.173.647-.057 1.432-.057 2.098A3.333 3.333 0 0 1 11.001 22m-.029-11.979c0-2.539.133-3.728-1.513-4.906c-.809-.58-3.496-.789-5.694-.583M5.503 2L3.146 4.11a.5.5 0 0 0-.003.706l2.36 2.231"
                            />
                          </g>
                        </svg>
                      </span>
                    </template>
                  </n-input>
                </strong>
                <span class="input">
                  <svg
                    width="32px"
                    height="32.00px"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M136.533333 273.066667a68.266667 68.266667 0 0 0-68.266666 68.266666v204.8a34.133333 34.133333 0 0 0 34.133333 34.133334h273.066667a34.133333 34.133333 0 0 0 34.133333-34.133334V307.2a34.133333 34.133333 0 0 0-34.133333-34.133333H136.533333z m512 0a34.133333 34.133333 0 0 0-34.133333 34.133333v238.933333a34.133333 34.133333 0 0 0 34.133333 34.133334h273.066667a34.133333 34.133333 0 0 0 34.133333-34.133334v-204.8a68.266667 68.266667 0 0 0-68.266666-68.266666h-238.933334zM102.4 648.533333a34.133333 34.133333 0 0 1 34.133333-34.133333h238.933334a34.133333 34.133333 0 0 1 34.133333 34.133333v307.2a34.133333 34.133333 0 0 1-34.133333 34.133334H170.666667a68.266667 68.266667 0 0 1-68.266667-68.266667v-273.066667z m546.133333-34.133333a34.133333 34.133333 0 0 0-34.133333 34.133333v307.2a34.133333 34.133333 0 0 0 34.133333 34.133334h204.8a68.266667 68.266667 0 0 0 68.266667-68.266667v-273.066667a34.133333 34.133333 0 0 0-34.133333-34.133333h-238.933334z"
                      fill="#FF7744"
                    />
                    <path
                      d="M743.901867 79.530667a68.266667 68.266667 0 0 0-93.2864-25.019734l-133.632 77.141334-133.632-77.141334a68.266667 68.266667 0 1 0-68.266667 118.237867L443.733333 247.022933 443.733333 834.218667V955.733333a34.133333 34.133333 0 0 0 34.133334 34.133334h68.266666a34.133333 34.133333 0 0 0 34.133334-34.133334v-102.024533V307.2 252.791467l138.615466-80.042667 4.539734-2.833067a68.266667 68.266667 0 0 0 20.48-90.4192z"
                      fill="#FFAA44"
                    />
                  </svg>
                </span>
              </div>
              <btnMessage />
              <!-- 语言切换按钮 -->
              <n-dropdown :options="languageOptions" @select="handleLanguageChange">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <span class="language-switch">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12.87 15.07l-2.54-2.51l.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5l3.11 3.11l.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
                        />
                      </svg>
                    </span>
                  </template>
                  {{ $t('common.language') }}
                </n-tooltip>
              </n-dropdown>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <span class="minimize" @click="toMini"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 14h4m0 0v4m0-4l-6 6m14-10h-4m0 0V6m0 4l6-6"
                      />
                    </svg>
                  </span>
                </template>
                {{ $t('app.minimize') }}
              </n-tooltip>
            </div>
          </div>
          <div :class="['bizyair-menu', { 'is-mini-menu': isMiniMenu }]">
            <div class="bizyair-menu-content">
              <btnProfile v-if="statusStore.isLogin" />
              <btnApiKey v-else />
              <btnCommunity />
              <btnPublish />
              <btnTrain />
              <btnDocs />
              <btnAssistant />
              <btnExport />
              <!-- <btnNews /> -->
              <apiKeyDialog />
              <ExportDialog />
            </div>
          </div>
        </div>
        <ModelDetail v-if="communityStore.showCommunityDetail" />
      </n-notification-provider>
    </n-message-provider>
    <Sidebar />
  </vTheme>
</template>
<script setup lang="ts">
  import btnApiKey from '@/views/btnApiKey/index.vue'
  import btnProfile from '@/views/btnProfile/index.vue'
  import btnCommunity from '@/views/btnCommunity/index.vue'
  import btnPublish from '@/views/btnPublish/index.vue'
  import btnTrain from '@/views/btnTrain/index.vue'
  import btnDocs from '@/views/btnDocs/index.vue'
  import btnAssistant from '@/views/btnAssistant/index.vue'
  import btnExport from '@/views/btnExport/index.vue'
  // import btnNews from '@/views/btnNews/index.vue'
  import btnMessage from '@/views/btnMessage/index.vue'
  import apiKeyDialog from '@/views/btnApiKey/apiKeyDialog.vue'
  import ExportDialog from '@/components/export/ExportDialog.vue'
  import { useStatusStore } from '@/stores/userStatus'
  import { provide, ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLanguageStore } from '@/stores/languageStore'
  import { NInput, NTooltip, NMessageProvider, NNotificationProvider, NDropdown } from 'naive-ui'

  import { useCommunityStore } from '@/stores/communityStore'
  import { get_share_code } from '@/api/model'
  import { get_user_language_profile, put_user_language_profile } from '@/api/user'

  import ModelDetail from '@/components/community/detail/Index.vue'
  import { useToaster } from '@/components/modules/toats/index'
  import vTheme from './components/modules/vTheme.vue'
  import Sidebar from '@/components/assistant/Sidebar.vue'

  const { t, locale } = useI18n()
  const languageStore = useLanguageStore()

  const shareInput = ref(null)

  const getUserLanguageProfile = async () => {
    try {
      const res = await get_user_language_profile()
      if (res.data?.global?.lang) {
        const userLang = res.data.global.lang
        languageStore.setLocale(userLang)
        locale.value = userLang
      } else {
        languageStore.setLocale('zh')
        locale.value = 'zh'
      }
    } catch (error) {
      languageStore.setLocale('zh')
      locale.value = 'zh'
    }
  }
  onMounted(() => {
    getUserLanguageProfile()
  })

  locale.value = languageStore.locale

  const languageOptions = computed(() => [
    {
      label: t('common.english'),
      key: 'en'
    },
    {
      label: t('common.chinese'),
      key: 'zh'
    }
  ])

  const handleLanguageChange = async (key: string) => {
    languageStore.setLocale(key)
    locale.value = key

    try {
      await put_user_language_profile({
        global: {
          lang: key
        }
      })
    } catch (error) {
      useToaster({
        type: 'error',
        message: t('common.languageUpdateFailed')
      })
    }
  }

  const communityStore = useCommunityStore()
  // communityStore.setAndShowCommunityDetail(modelId, versionId)

  const statusStore = useStatusStore()
  statusStore.loginRefresh('loading')
  statusStore.sendSocket(res => {
    provide('socket', res)
  })

  const isMini = ref(false)
  const isMiniMenu = ref(false)
  const shareCode = ref('')

  const convert = async () => {
    const res = await get_share_code({ code: shareCode.value })
    communityStore.setAndShowCommunityDetail(
      Number(res.data.data.bizy_model_id),
      Number(res.data.data.biz_id)
    )
    shareCode.value = ''
  }
  const toMini = () => {
    isMiniMenu.value = true
    setTimeout(() => {
      isMini.value = true
    }, 300)
  }

  const toNormal = () => {
    isMini.value = false
    setTimeout(() => {
      isMiniMenu.value = false
    }, 400)
  }

  const runShareCode = async () => {
    if (shareCode.value) {
      shareCode.value = shareCode.value.trim()
      if (shareCode.value.length != 8) {
        useToaster({
          type: 'error',
          message: t('app.shareCode.error.shareCodeLength')
        })
        shareCode.value = ''
        return false
      }
      convert()
    } else {
      try {
        const clipboardText = await navigator.clipboard.readText()
        if (!clipboardText || typeof clipboardText !== 'string') {
          useToaster({
            type: 'error',
            message: t('app.shareCode.error.empty')
          })
          return false
        }
        const trimmedClipboardText = clipboardText.trim()
        if (trimmedClipboardText.length != 8) {
          useToaster({
            type: 'error',
            message: t('app.shareCode.error.length')
          })
          return false
        }
        shareCode.value = trimmedClipboardText
        convert()
      } catch (error) {
        useToaster({
          type: 'error',
          message: error
        })
      }
    }
  }
</script>
<style scoped lang="less">
  .bizyair-menu-box {
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0, 0, 0.1, 1.8);
    width: 554px;

    .bizyair-bar {
      background-color: #7c3aed;
      display: flex;
      justify-content: space-between;
      border-radius: 12px 12px 0 0;
      cursor: move;
      height: 36px;
    }

    h1 {
      color: #fff;
      margin: 0;
      padding: 4px 6px;
      display: flex;

      img {
        width: 28px;
        height: 28px;
        margin-right: 4px;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      span {
        font-size: 16px;
        line-height: 28px;
      }
    }

    .handle {
      display: flex;
      padding: 4px 8px;

      span {
        cursor: pointer;
        display: block;
        width: 28px;
        height: 28px;
        padding: 6px;
        box-sizing: border-box;
        border-radius: 20px;
        margin-left: 8px;
        background-color: rgba(0, 0, 0, 0.2);

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .language-switch {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .bizyair-menu {
      width: 100%;
      height: 48px;
      box-sizing: border-box;
      transition: all 0.3s;

      .bizyair-menu-content {
        height: 40px;
        display: flex;
        justify-content: space-between;
        padding: 4px 12px;
        background-color: rgb(72, 72, 78);
        border-radius: 0 0 12px 12px;
        min-width: 460px;
        white-space: nowrap;
      }
    }

    .is-mini-menu {
      height: 0;
      opacity: 0;
      padding: 0 12px;
      overflow: hidden;
    }

    .share-input-box {
      display: flex;
      align-items: center;
      position: relative;

      .share-input {
        border-radius: 8px;
        overflow: hidden;
        background-color: #0f172a;
        width: 0px;
        transition: all 0.3s;
        height: 28px;
        position: absolute;
        right: 32px;
        top: 0;
      }

      &:hover .share-input {
        width: 154px;
      }
    }
    .share-input-box-has-val {
      .share-input {
        width: 154px;
      }
    }
  }

  .is-mini-box {
    width: 38px;
    overflow: hidden;
    h1 {
      padding-left: 5px;
    }
  }
</style>
