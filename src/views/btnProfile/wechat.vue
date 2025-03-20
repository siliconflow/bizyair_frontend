<template>
  <canvas ref="qrcodeCanvas"></canvas>
</template>
<script setup lang="ts">
  import QRCode from 'qrcode'
  import { onMounted, ref, watch } from 'vue'

  const props = defineProps<{
    text: string
  }>()
  const qrcodeCanvas = ref<HTMLCanvasElement | null>(null)

  const generateQRCode = async () => {
    try {
      await QRCode.toCanvas(qrcodeCanvas.value, props.text, {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      const ctx = qrcodeCanvas.value?.getContext('2d')
      if (!ctx) return
      const logoSize = 60
      const logo = new Image()
      logo.src =
        'data:image/png;base64,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'
      logo.onload = () => {
        const centerX = (qrcodeCanvas.value!.width - logoSize) / 2
        const centerY = (qrcodeCanvas.value!.height - logoSize) / 2
        ctx.drawImage(logo, centerX, centerY, logoSize, logoSize)
        ctx.beginPath()
        ctx.arc(centerX + logoSize / 2, centerY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
      }
    } catch (err) {
      console.error('Failed to generate QR code', err)
    }
  }
  onMounted(() => {
    generateQRCode()
  })
  watch(
    () => props.text,
    () => {
      generateQRCode()
    }
  )
</script>
<style scoped lang="less">
  canvas {
    width: 240px;
    height: 240px;
    margin: 0;
    padding: 0;
  }
</style>
