<template>
  <div>
    <h1>Yesdok RTC Examples</h1>
    <div id="videos" class="container">
      <video id="localVideo" class="vid" autoplay muted></video>
    </div>
    <br />
    <div style="display:block">
      <button id="switchButton" class="settings" @click="switchMedia()">Switch Camera</button>
      <button id="muteButton" class="settings" @click="toggleMute()">Unmuted</button>
      <button id="vidButton" class="settings" @click="toggleVid()">Video Enabled</button>
    </div>
  </div>
</template>

<script>
const Peer = require('simple-peer')
const getUserMedia = require('getusermedia')
// import socketIO from 'self.socket.io-client'
// const socket = socketIO('http://localhost:3012', {transports: ['websocket']})

let peers = {}
let localStream = null



const configuration = {
  // Using From https://www.metered.ca/tools/openrelay/
  "iceServers": [
    {
      urls: "stun:openrelay.metered.ca:80"
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
}

export default {
  name: 'Tutorial',
  data() {
    return {
      socket: null,
      // peers: {}
    }
  },
  methods: {
    init() {
      const self = this
      this.socket = this.$nuxtSocket({
        name: 'global',
        channel: '/',
        url: 'http://localhost:3012'
      })

      self.socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        self.addPeer(socket_id, false)

        self.socket.emit('initSend', socket_id)
      })

      self.socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        self.addPeer(socket_id, true)
      })

      self.socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        self.removePeer(socket_id)
      })

      self.socket.on('disconnect', () => {
        console.log('GOT DISCONNECTED')
        for (let socket_id in peers) {
          self.removePeer(socket_id)
        }
      })

      self.socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
      })
    },
    removePeer(socket_id) {
      let videoEl = document.getElementById(socket_id)
      if (videoEl) {
        const tracks = videoEl.srcObject.getTracks();
        tracks.forEach(function (track) {
          track.stop()
        })
        videoEl.srcObject = null
        videoEl.parentNode.removeChild(videoEl)
      }
      if (peers[socket_id]) peers[socket_id].destroy()
      delete peers[socket_id]
    },
    addPeer(socket_id, am_initiator) {
      const self = this
      peers[socket_id] = new Peer({
        initiator: am_initiator,
        stream: localStream,
        config: {
          iceServers: [
            {
              urls: "stun:openrelay.metered.ca:80"
            },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject"
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject"
            },
            {
              urls: "turn:openrelay.metered.ca:443?transport=tcp",
              username: "openrelayproject",
              credential: "openrelayproject"
            }
          ]
        }
      })

      console.log('debug', JSON.stringify(peers))
      peers[socket_id].on('signal', data => {
        self.socket.emit('signal', {
          signal: data,
          socket_id: socket_id
        })
      })

      peers[socket_id].on('stream', stream => {
        let newVid = document.createElement('video')
        newVid.srcObject = stream
        newVid.id = socket_id
        newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        newVid.onclick = () => self.openPictureMode(newVid)
        newVid.ontouchstart = (e) => self.openPictureMode(newVid)
        videos.appendChild(newVid)
      })
    },
    openPictureMode(el) {
      console.log('opening pip')
      el.requestPictureInPicture()
    },
    switchMedia() {
      const self = this
      if (constraints.video.facingMode.ideal === 'user') {
        constraints.video.facingMode.ideal = 'environment'
      } else {
        constraints.video.facingMode.ideal = 'user'
      }

      const tracks = localStream.getTracks();

      tracks.forEach(function (track) {
        track.stop()
      })

      localVideo.srcObject = null
      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        for (let socket_id in peers) {
          for (let index in peers[socket_id].streams[0].getTracks()) {
            for (let index2 in stream.getTracks()) {
              if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                break;
              }
            }
          }
        }
        localStream = stream
        localVideo.srcObject = stream
        self.updateButtons()
      })
    },
    setScreen() {
      const self = this
      navigator.mediaDevices.getDisplayMedia().then(stream => {
        for (let socket_id in peers) {
          for (let index in peers[socket_id].streams[0].getTracks()) {
            for (let index2 in stream.getTracks()) {
              if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                break
              }
            }
          }
        }
        localStream = stream
        localVideo.srcObject = localStream
        self.socket.emit('removeUpdatePeer', '')
      })
      self.updateButtons()
    },
    removeLocalStream() {
      const self = this
      if (localStream) {
        const tracks = localStream.getTracks();

        tracks.forEach(function (track) {
          track.stop()
        })

        localVideo.srcObject = null
      }

      for (let socket_id in peers) {
        self.removePeer(socket_id)
      }
    },
    toggleMute() {
      for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
      }
    },
    toggleVid() {
      for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
      }
    },
    updateButtons() {
      for (let index in localStream.getVideoTracks()) {
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
      }
      for (let index in localStream.getAudioTracks()) {
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
      }
    }
  },
  mounted() {
    const self = this
    getUserMedia({video: true, audio: false}, function (err, stream) {
      if (err) {
        console.log('getUserMedia Error', err)
      } else {
        const video = document.getElementById('localVideo')

        if('srcObject' in video) {
          video.srcObject = stream
          localStream = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browser
          localStream = stream
        }
        video.play()
      }
    })
    self.init()
  }
}
</script>

<style scoped>
  .containers {
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fit, 1fr);
    grid-template-rows: repeat(auto-fit, 300px);
  }

  .container {
    display: flex;
  }

  .vid {
    flex: 0 1 auto;
    height: 400px;
  }

  .settings {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 2px 2px;
    cursor: pointer;
  }
</style>