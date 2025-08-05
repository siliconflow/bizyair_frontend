import { defineStore } from 'pinia'
// import { ref } from 'vue'
import { server_mode } from '@/api/user'

export const useServerModeStore = defineStore('serverMode', () => {

  // const isServerMode = ref(null)

  const setIsServerMode = async () => {
    console.log('+++++++++++++++++++server_mode+++++++++++++++++++')
    console.log((window as any).isServerModeValue)
    if ((window as any).isServerModeValue !== undefined) {
      return (window as any).isServerModeValue
    } else {
      const serverModeResponse = await server_mode();
      (window as any).isServerModeValue = serverModeResponse?.data?.server_mode
      return serverModeResponse?.data?.server_mode
    }
  }

  return {
    setIsServerMode
  }
})
