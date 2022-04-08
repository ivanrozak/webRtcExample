<template>
  <div>
    <Test />
    <button @click="connectSocket()">connect practice</button>
    <button @click="getSchedule()">get schedule</button>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      socketGlobal: null,
      socket: null
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
      console.log('GLOBAL SOCKET CONNECTED')
    })
  },
  methods: {
    getSchedule () {
      this.$store.dispatch('getCurrentSchedule')
    },
    makeid (length) {
      let result = ''
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    },
    async connectSocket () {
      const self = this
      this.$store.commit('SET_SOCKET_PRACTICE', this.makeid(10))

      this.socket = await this.$nuxtSocket({
        name: 'practicing',
        channel: '/',
        persist: this.$store.state.practiceSocket.PersistName,
        url: 'https://socks7server13.yesdok.com'
        // reconnection: false,
      })

      this.socket.on('connect', () => {
        console.log('socket practicing connected')
        self.$store.dispatch('doctorAuthorization').then((res) => {
          self.sendNotification()
        }).catch(() => {
          // location.reload()
        })
      })

      this.socket.on('error', (data) => {
        console.log('socket practicing error', data)
      })

      this.socket.on('reconnect', (data) => {
        console.log('socket practicing reconnect', data)
      })

      this.socket.on('connect_error', (data) => {
        console.log('socket practicing connect error', data)
      })

      this.socket.on('disconnect', (data) => {
        // this.$store.dispatch('consultation/onDisconnect')
        console.log('socket practicing disconnect', data)
        
      })

      this.socket.on('Call', (data, response) => {
        console.log('GET START CALL', data)
        response(1)
        // this.$store.dispatch('consultation/onCall', data)
      })

      this.socket.on('Data', (data, response) => {
        response(1)
        // this.$store.dispatch('consultation/onData', data)
        console.log('data => ', data)
      })

      this.socket.on('Message', (data, response) => {
        console.log('message => ', data)
        // response(1)

        // this.$store.dispatch('consultation/onMessage', data)

        // if (data.CallType) {
        //   this.mode = data.CallType
        // }

        // if (data.id === 'Reconnect') {
        //   this.isWaitingPatientBack = false

        //   if (this.$store.state.consultation.consultation.consultationMode === 'Video') { this.remoteHasIceCandidate = false }

        //   // init consultation
        //   this.preparingConsultation({
        //     iceRestart: true
        //   })

        //   this.$store.dispatch('consultation/log', {
        //     data: 'Patient Reconnect',
        //     status: 'INFO'
        //   })
        // }
      })

      this.socket.on('EndCall', (data, response) => {
      })

      this.socket.on('ScheduleEnded', (data, response) => {
      })

      this.socket.on('PatientDisconnect', (data, response) => {
        
      })
    },
    sendNotification () {
      this.$store.dispatch('sendPushNotifiation').then((res) => {
        console.log(res, 'res notif')
      })
    }
  },
  destroyed () {
    this.$nuxt.$off('connectSocket')
    this.$nuxt.$off('disconnectSocket')
    this.$nuxt.$off('cancelConsultation')
    this.$nuxt.$off('stopCheckingSchedule')
    this.$nuxt.$off('stopRecording')
    this.$nuxt.$off('patientNoAnswer')
    this.$nuxt.$off('patientRejectCall')
    this.$nuxt.$off('eventSubmitted')
  }
}
</script>
