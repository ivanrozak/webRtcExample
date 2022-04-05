<template>
  <div>
    <h1>YD RTC Example</h1>
    <div style="display: flex;">
      <div>
        <video id="consultationVideo" class="vid" autoplay muted></video>
        <h3>Local Video</h3>
      </div>
      <div>
        <video id="remoteVideo"></video>
        <h3>Remote Video</h3>
      </div>
    </div>
    <button>Call Patient</button>
  </div>
</template>

<script>
const Peer = require('simple-peer')
const getUserMedia = require('getusermedia')

let PEER = null; let LOCAL_STREAM = null; let REMOTE_STREAM = null

export default {
  name: 'Example',
  data() {
    return {
      socket: null,
      socketGlobal: null
    }
  },
  mounted() {
    this.init()
    this.socketGlobal = this.$nuxtSocket({
      name: 'global',
      channel: '/',
      url: 'https://server13.yesdok.com:3002'
    })

    this.socket = this.$nuxtSocket({
      name: 'practicing',
      channel: '/',
      url: 'https://socks7server13.yesdok.com'
    })
  },
  methods: {
    connectSocket() {
      // this.socketGlobal = await this.$nuxtSocket({
      //   name: 'global',
      //   channel: '/',
      //   url: 'https://server13.yesdok.com:3002'
      // })

      // this.socket = await this.$nuxtSocket({
      //   name: 'practicing',
      //   channel: '/',
      //   url: 'https://socks7server13.yesdok.com'
      // })

      this.socket.on('connect', () => {
        // this.$store.dispatch('consultation/onConnect')
        // this.$store.dispatch('consultation/doctorAuthorization').then((res) => {
        //   this.sendNotification()
        // }).catch(() => {
        //   location.reload()
        // })
        console.log('connected')
      })

      this.socket.on('error', (data) => {
        console.log('globalSocket/log', {
          data: 'Consultation Socket Error: ' + JSON.stringify(data),
          status: 'ERROR'
        })
      })

      this.socket.on('reconnect', (data) => {
        console.log('globalSocket/log', {
          data: 'Consultation Socket Reconnect: ' + JSON.stringify(data),
          status: 'ERROR'
        })
      })

      this.socket.on('connect_error', (data) => {
        console.log('globalSocket/log', {
          data: 'Consultation Socket Connect Error: ' + JSON.stringify(data),
          status: 'ERROR'
        })
      })

      this.socket.on('disconnect', (data) => {
        console.log('on disconnect', data)
        // this.$store.dispatch('consultation/onDisconnect')
        // this.$store.dispatch('consultation/checkIncompleteConsultation')
      })

      this.socket.on('Call', (data, response) => {
        console.log('GET START CALL')
        // response(1)
        // this.$store.dispatch('consultation/onCall', data)
        // this.mode = data.Type
      })

      this.socket.on('Data', (data, response) => {
        // response(1)
        // this.$store.dispatch('consultation/onData', data)
      })

      this.socket.on('Message', (data, response) => {
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
        // response(1)
        // if (!this.$store.state.consultation.isRecorded) {
        //   clearInterval(DRAWER)
        // }

        // this.stopRecording(true)
        // this.$store.dispatch('consultation/onPatientEndCall').then((response) => {
        //   if (this.$store.state.consultation.callEndedBy === 'patient') {
        //     this.$bvModal.show('modalIsPatientNeedSummary')
        //   }
        // })
        // this.$bvModal.hide('modalIceConnectionDie')
        // this.$bvModal.hide('modalPatientConnectionDie')
        // this.connectionDisconnect = false
        // this.arrangeModalPositionToConsultationContainer('modalIsPatientNeedSummary')
      })

      this.socket.on('ReceivingFile', (data, response) => {
        // response(1)
        // this.$store.dispatch('consultation/onReceivingFile', data)
      })

      this.socket.on('FileReceived', (data, response) => {
        // response(1)
        // this.$emit('openFileAttachment')
        // this.$store.dispatch('consultation/onFileReceived', data)
      })

      this.socket.on('Chat', (data, response) => {
        // response(1)
        // this.$store.dispatch('consultation/onChat', data)
      })

      this.socket.on('ScheduleEnded', (data, response) => {
        // response(1)
        // this.$store.dispatch('consultation/onScheduleEnded', data)
        // this.closeSocket(true)
        // const getCurrentSchedule = this.$store.state.calendar.currentSchedule

        // setTimeout(() => {
        //   this.$store.commit('consultation/RESET')

        //   this.checkSchedule().then((resScheduleCheck) => {
        //     if (!resScheduleCheck || typeof resScheduleCheck === 'undefined' || resScheduleCheck === '' || resScheduleCheck == null) {
        //       console.log('NEXT SCHEDULE NOT FOUND')
        //       console.log('OPEN MODAL EXTEND EVENT')
        //       this.formExtendSchedule.price = parseFloat(getCurrentSchedule.Price)
        //       // show popup create schedule
        //       this.$bvModal.show('modalFormEvent')
        //     } else {
        //       console.log('NEXT SCHEDULE FOUND')
        //       this.openConsultation()
        //     }
        //   })
        // }, 2000)
      })

      this.socket.on('PatientDisconnect', (data, response) => {
        // response(1)
        // if (!this.$store.state.consultation.isRecorded) {
        //   clearInterval(DRAWER)
        // }
        // this.$sentry.captureException(new Error(`[PATIENT_DISCONNECTED] ${data}`))
        // this.stopRecording()
        // this.$store.dispatch('consultation/onPatientDisconnect')
        // if (!this.connectionDisconnect && this.$store.state.consultation.callStatus === 'IN_CALL') {
        //   this.$bvModal.show('modalPatientConnectionDie')
        //   this.arrangeModalPositionToConsultationContainer('modalPatientConnectionDie', '30vh')
        // }
      })
    },

    init() {
      getUserMedia({ video: true, audio: true }, function (err, stream) {
        if (err) {
          console.error(err)
          return
        }

        const video = document.getElementById('consultationVideo')

        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        }

        video.play()
      })
    },

    prepareConsultation() {
      const self = this
      // self.$store.commit('consultation/SET_CALL_STATUS', 'PROCESSING_CALL')
      // self.$nuxt.$off('setPeerSignal')
      // self.$nuxt.$off('destroyPeer')
      // self.$store.dispatch('consultation/log', {
      //   data: 'Preparing Consultation...',
      //   status: 'INFO'
      // })
      getUserMedia({ video: true, audio: true }, function (err, stream) {
        if (err) {
          console.error(err)
          return
        }

        PEER = new Peer({
          initiator: true,
          trickle: true,
          stream,
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

        // const SignalTime = self.$moment().unix()
        PEER.on('iceStateChange', (data) => {
          console.log(data)
          // self.$store.dispatch('consultation/log', {
          //   data: 'Ice State Change: ' + JSON.stringify(data),
          //   status: 'INFO'
          // })

          // if (data === 'disconnected' && self.$store.state.consultation.inConsultation && !self.connectionDisconnect) {
          //   self.isDoctorReconnect = false
          //   self.$bvModal.show('modalPatientConnectionDie')
          //   self.arrangeModalPositionToConsultationContainer('modalPatientConnectionDie', '30vh')
          // }

          // if (data === 'connected') {
          //   self.$bvModal.hide('modalIceConnectionDie')
          //   self.$bvModal.hide('modalPatientConnectionDie')
          //   self.$bvModal.hide('modalSomethingWrong')
          //   self.connectionDisconnect = false
          //   self.$store.commit('globalSocket/SET_IS_DOCTOR_RECONNECT', false)
          // }
        })
        PEER.on('signal', (data) => {
          // self.$store.dispatch('consultation/log', {
          //   data: 'Signal data: ' + JSON.stringify(data),
          //   status: 'INFO'
          // })

          if (data.sdp) {
            // self.$store.dispatch('consultation/emitCall', {
            //   sdp: data.sdp
            // })

            // generate offer
            // self.$store.dispatch('consultation/log', {
            //   data: 'Generate Offer: ' + JSON.stringify(data.sdp),
            //   status: 'INFO'
            // })
            // self.$store.dispatch('consultation/emitMessage', { id: 'GenerateOffer', data: data.sdp })
          }

          if (data.candidate) {
            // if (self.$store.state.consultation.callStatus === 'IN_CALL') {
            //   console.log('EMIT ICE CANDIDATE IN CALL', data.candidate)
            //   self.$store.dispatch('consultation/emitMessage', { id: 'IceCandidate', data: data.candidate })
            //   self.$store.commit('RTC/ADD_NEW_CANDIDATE', data.candidate)
            // } else if (self.$store.state.consultation.callStatus === 'PROCESSING_CALL') {
            //   console.log('EMIT ICE CANDIDATE IN PROCESSING CALL', data.candidate)
            //   self.$store.commit('RTC/ADD_NEW_CANDIDATE', data.candidate)
            // }
          }
        })
        PEER.on('error', (data) => {
          // self.stopRecording()
          // self.$store.dispatch('consultation/log', {
          //   data: 'Peer Error: ' + JSON.stringify(data),
          //   status: 'ERROR'
          // })
          // self.$nuxt.$emit('destroyPeer')
          // self.$nuxt.$off('setPeerSignal')
          // self.$nuxt.$off('destroyPeer')
        })
        self.peerOnStream(!!(options && options.iceRestart))
        // PEER._debug = console.log

        self.socketGlobal('setPeerSignal', (type, data) => {
          // self.$store.dispatch('consultation/log', {
          //   data: 'Set Peer Signal on: ' + SignalTime,
          //   status: 'INFO'
          // })

          if (type === 'sdp') {
            // self.$store.dispatch('consultation/log', {
            //   data: 'Peer Answer ' + JSON.stringify(data),
            //   status: 'INFO'
            // })
            PEER.signal({
              type: 'answer',
              sdp: data
            })
          } else if (type === 'candidate') {
            // console.log('GOT ICE CANDIDATE', data)

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
        self.socketGlobal('destroyPeer', (type, data) => {
          // self.$store.dispatch('consultation/log', {
          //   data: 'Peer Destroyed: ' + JSON.stringify(data),
          //   status: 'INFO'
          // })
          PEER.destroy()
        })
      })
    }
  }
}
</script>