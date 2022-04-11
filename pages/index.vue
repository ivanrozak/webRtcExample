<template>
  <div class="container">
    <h1>Web RTC Example</h1>
    <div class="video-section">
      <div>
        <video id="localVideo" muted="muted" width="200" />
        <h3>Doctor Video</h3>
      </div>
      <div v-if="inConsultation">
        <video id="remoteVideo" width="200" />
        <h3>Patient Video</h3>
      </div>
    </div>
    <div>
      <button @click="checkBeforeConsultation()">Mulai Konsultasi</button>
    </div>
  </div>
</template>

<script>
const Peer = require('simple-peer')
const getUserMedia = require('getusermedia')

let PEER = null; let LOCAL_STREAM = null; let REMOTE_STREAM = null;

export default {
  name: 'Index',
  data() {
    return {
      socket: null,
      socketGlobal: null,
      inConsultation: false,
      isPatientLoggedIn: false
    }
  },
  mounted () {
    this.init()
    if (this.$store.state.user.Token === '') {
      this.$router.push('/login')
    }
    // first check Appointment with patient
    this.getSchedule()
    // check isCalling condition
    if (this.$store.state.consultation.isCalling) {
      // init consultation
      this.preparingConsultation({
        iceRestart: this.$store.state.consultation.consultation.status === 'PatientDisconnect'
      })
      console.log('Playing Incoming Sound')
    } else {
      console.log('stop incoming call sound')
    }
  },
  methods: {
    init () {
      // this.$store.commit('consultation/RESET')
      const self = this
      getUserMedia({ video: true, audio: true }, function (err, stream) {
        if (err) {
          console.error(err)
          return
        }
        const video = document.getElementById('localVideo')
        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        }
        video.play()
        // self.$store.commit('consultation/SET_VIDEO_STREAM', stream)
        // self.actionAfterReconnect()
      })
    },
    getSchedule () {
      this.$store.dispatch('getCurrentSchedule')
    },
    // steps before Consultation
    async checkBeforeConsultation() {
      await this.checkLoginPatient()
      await this.openConsultation()
    },
    checkLoginPatient() {
      const appointmentID = this.$store.state.currentSchedule.Appointment.ID
      this.$store.dispatch('consultation/checkLoginPatient', appointmentID)
        .then((res) => {
          this.isPatientLoggedIn = res.data.Data.IsPatientLoggedIn
        })
        .catch((err) => {
          throw new Error(err)
        })
    },
    openConsultation() {
      this.connectSocket()
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
          location.reload()
        })
      })

      this.socket.on('Call', (data, response) => {
        console.log('GET START CALL', data)
        response(1)
        this.$store.dispatch('consultation/onCall', data)
      })

      this.socket.on('Data', (data, response) => {
        response(1)
        // this.$store.dispatch('consultation/onData', data)
        console.log('data => ', data)
      })

      this.socket.on('Message', (data, response) => {
        console.log('message => ', data)
        response(1)

        this.$store.dispatch('consultation/onMessage', data)

        if (data.CallType) {
          // this.mode = data.CallType
        }

        if (data.id === 'Reconnect') {
          // this.isWaitingPatientBack = false

          // if (this.$store.state.consultation.consultation.consultationMode === 'Video') { this.remoteHasIceCandidate = false }

          // init consultation
          // this.preparingConsultation({
          //   iceRestart: true
          // })

          // this.$store.dispatch('consultation/log', {
          //   data: 'Patient Reconnect',
          //   status: 'INFO'
          // })
        }
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

      this.socket.on('EndCall', (data, response) => {
        console.log('Endcall', data, response)
      })

      this.socket.on('ScheduleEnded', (data, response) => {
      })

      this.socket.on('PatientDisconnect', (data, response) => {
        
      })
    },
    preparingConsultation (options) {
      const self = this
      self.$store.commit('consultation/SET_CALL_STATUS', 'PROCESSING_CALL')
      console.log('Preparing Consultation ...')
      getUserMedia({ video: true, audio: true }, function (err, stream) {
        if (err) {
          console.log(error)
          return
        }

        PEER = new Peer({
          initiator: true,
          trickle: true,
          stream,
          offerOptions: {
            iceRestart: !!(options && options.iceRestart)
          },
          config: {
            iceServers: [
              {
                urls: ['stun:stun.l.google.com:19302']
              },
              {
                urls: ['stun:turn.quickblox.com'],
                username: 'quickblox',
                credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
              },
              {
                urls: ['turn:turn.quickblox.com:3478?transport=udp'],
                username: 'quickblox',
                credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
              },
              {
                urls: ['turn:turn.quickblox.com:3478?transport=tcp'],
                username: 'quickblox',
                credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
              },
              {
                urls: ['turn:turn.yesdok.com:3478'],
                username: 'guestaja',
                credential: 'somepasswordaja'
              },
              {
                urls: ['stun:stun.yesdok.com:3478'],
                username: 'guestaja',
                credential: 'somepasswordaja'
              }
            ]
          }
        })

        LOCAL_STREAM = stream

        const SignalTime = self.$moment().unix()
        PEER.on('iceStateChange', (data) => {
          console.log('icestatechange', JSON.stringify(data))
          if (data === 'disconnected') {
            console.log('peer disconnected')
          }
          if (data === 'connected') {
            console.log('peer connected')
          }
        })
        PEER.on('signal', (data) => {
          console.log('peer signal', JSON.stringify(data))
          if (data.sdp) {
            self.$store.dispatch('consultation/emitCall', {
              sdp: data.sdp
            })
            self.$store.dispatch('consultation/emitMessage', {
              id: 'GenerateOffer',
              data: data.sdp
            })
          }
          if (data.candidate) {
            if (self.$store.state.consultation.callStatus === 'IN_CALL') {
              console.log('EMIT ICE CANDIDATE IN CALL', data.candidate)
              self.$store.dispatch('consultation/emitMessage', { id: 'IceCandidate', data: data.candidate })
              // self.$store.commit('RTC/ADD_NEW_CANDIDATE', data.candidate)
            } else if (self.$store.state.consultation.callStatus === 'PROCESSING_CALL') {
              console.log('EMIT ICE CANDIDATE IN PROCESSING CALL', data.candidate)
              // self.$store.commit('RTC/ADD_NEW_CANDIDATE', data.candidate)
            }
          }
        })
        self.peerOnStream(!!(options && options.iceRestart))

        self.$nuxt.$on('setPeerSignal', (type, data) => {
          console.log('Set Peer Signal on: ' + SignalTime, type, data)

          if (type === 'sdp') {
            console.log('Peer Answer', JSON.stringify(data))
            PEER.signal({
              type: 'answer',
              sdp: data
            })
          } else if (type === 'candidate') {
            console.log('GOT ICE CANDIDATE', JSON.stringify(data))

            // self.remoteHasIceCandidate = true
            // self.$store.dispatch('consultation/log', {
            //   data: 'Remote Peer has Candidate',
            //   status: 'INFO'
            // })
            // self.$store.dispatch('consultation/log', {
            //   data: 'Peer Candidate ' + JSON.stringify(data),
            //   status: 'INFO'
            // })
            PEER.signal({
              candidate: data
            })
          }
        })
      })
    },
    peerOnStream() {
      if (PEER) {
        PEER.on('stream', function (remoteStream) {
          console.log('On Streaming : ', JSON.stringify(remoteStream))
          REMOTE_STREAM = remoteStream

          const remoteVideo = document.getElementById('remoteVideo')
          if ('srcObject' in remoteVideo) {
            remoteVideo.srcObject = remoteStream
          } else {
            remoteVideo.src = window.URL.createObjectURL(remoteStream) // for older browsers
          }
          remoteVideo.play()
        })
      }
    },
    sendNotification () {
      this.$store.dispatch('sendPushNotifiation').then((res) => {
        console.log(res, 'res notif')
      })
    }
  }
}
</script>

<style scoped>
*{
  font-family: sans-serif;
}
.container {
  padding: 10px;
}
.video-section {
  display: flex;
  justify-content: left;
  align-items: center;
}
button {
  padding: 5px 12px;
}
</style>
