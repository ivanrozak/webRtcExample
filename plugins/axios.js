/* eslint-disable */
export default function ({ $axios, store, redirect, $sentry }, inject) {
  $axios.setBaseURL(process.env.BASE_API)
  $axios.setHeader('DeviceType', 'web')
  $axios.onError((error) => {
    throw error.response
  })

  const api = $axios.create({
    timeout: 1000000
  })

  api.interceptors.request.use(
    (config) => {
      config.headers.DeviceType = 'Web'

      if (store.state.user) {
        config.headers.Authorization = `Bearer ${store.state.user.Token}`
      }

      return config
    },
    (error) => {
      console.log('request error ', error) // for debug
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response) => {
      const res = response
      return res
    },
    (error) => {
      $sentry.captureException(error)

      // if (error.response && error.response.status === 400) {
      //   return Promise.reject(error)
      // } else if (error.response && error.response.status === 401) {
      //   $nuxt.$swal({
      //     icon: 'error',
      //     title: 'Sesi Habis',
      //     text: 'Anda telah keluar dari akun. Silakan masuk kembali.'
      //   }).then(() => {})

      //   store.dispatch('user/logout').then(() => {
      //     redirect('/auth/login')
      //   })
      // } else {
      //   return Promise.reject(error)
      // }

      return Promise.reject(error)
    }
  )

  inject('api', api)
}
