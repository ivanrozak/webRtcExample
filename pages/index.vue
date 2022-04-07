<template>
  <Test />
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      socketGlobal: null
    }
  },
  mounted () {
    this.$store.commit('SET_SOCKET_PERSIST', this.makeid(10))
    console.log(this.$store.state.socket.PersistName)
    this.socketGlobal = this.$nuxtSocket({
      name: 'global',
      channel: '/',
      persist: this.$store.state.socket.PersistName,
      url: 'https://server13.yesdok.com:3002'
    })

    this.socketGlobal.on('connect', () => {
      this.$store.dispatch('authorization')
      // this.$store.commit('globalSocket/CONNECT', true)
      console.log('GLOBAL SOCKET CONNECTED')
    })
  },
  methods: {
    makeid (length) {
      let result = ''
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    }
  }
}
</script>
