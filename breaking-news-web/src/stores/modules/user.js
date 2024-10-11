import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'breaking-user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value == ''
    }

    const user = ref({})

    const getUser = async () => {
      const res = await userGetInfoService() // 请求获取数据
      user.value = res.data.data
    }
    const setUser = (obj) => (user.value = obj)

    return { token, setToken, removeToken, user, getUser, setUser }
  },
  {
    persist: true
  }
)
import { userGetInfoService } from '@/api/user'
const user = ref({})
export const getUser = async () => {
  const res = await userGetInfoService() // 请求获取数据
  user.value = res.data.data
}
