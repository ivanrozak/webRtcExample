const BASE_API = 'https://server13.yesdok.com/api/3.0/'

export const state = () => ({
  user: {
    Role: '',
    Token: 'n0tmxZhlP7n5IO7qGaLJOfTeBsSN3gtrQ4y8cmw3BSZUmTazQdYlqPt1UzJfLWHG',
    TokenType: ''
  },
  socket: {
    PersistName: ''
  },
  practiceSocket: {
    PersistName: ''
  },
  currentSchedule: null,
  doctorSessionID: '',
  scheduleTimer: {
    counterIntervalObject: null,
    epochTimer: null,
    timerSeconds: '',
    timerMinutes: '',
    timerHours: '',
    timerDays: '',
    timerWeeks: '',
    timerMonths: '',
    timerYears: ''
  }
})

export const mutations = {
  SET_CURRENT_SCHEDULE: (state, value) => {
    state.currentSchedule = value
  },
  SET_DOCTOR_SESSION_ID: (state, value) => {
    state.doctorSessionID = value
  },
  SET_SCHEDULE_TIMER: (state, data) => {
    const { key, value } = data
    state.scheduleTimer[key] = value
  },
  SET_USER(state, data) {
    state.user = data
  },
  SET_SOCKET_PERSIST(state, data) {
    state.socket.PersistName = data
  },
  SET_SOCKET_PRACTICE(state, data) {
    state.practiceSocket.PersistName = data
  }
}

export const actions = {
  authorization ({ commit, dispatch, state }) {
    return new Promise((resolve, reject) => {
      console.log('[GLOBAL SOCKET] Authorizing...', state.socket.PersistName, state.user.Token)
      dispatch(
        '$nuxtSocket/emit',
        {
          label: state.socket.PersistName,
          evt: 'Authorization',
          msg: state.user.Token,
        }, { root: true }
      ).then((resEmit) => {
        console.log('[GLOBAL SOCKET] Authorized')
        resolve(true)
      }).catch((errorEmit) => {
          console.log('[GLOBAL SOCKET] Failed Authorized')
        reject(errorEmit)
      })
    })
  },
  doctorAuthorization ({ commit, dispatch, state }) {
    return new Promise((resolve, reject) => {
      dispatch('setQueue').then((res) => {
        dispatch(
          '$nuxtSocket/emit',
          {
            label: state.practiceSocket.PersistName,
            evt: 'DoctorAuthorization',
            msg: state.doctorSessionID
          }, { root: true }
        ).then((resEmit) => {
          // dispatch('log', {
          //   data: 'Doctor Authorized as ' + state.doctorSessionID,
          //   status: 'INFO',
          // })
          console.log('Doctor Authorized')
          // commit('SET_DOCTOR_AUTHORIZED', true)
          // if (state.consultation.status !== 'DoctorReconnect') { commit('SET_POSITION', 2) }
          resolve(true)
        }).catch((errorEmit) => {
          // dispatch('log', {
          //   data: 'Emit Doctor Authorization Error',
          //   status: 'ERROR',
          // })
          console.log('Doctor Authorized Error')
          reject(errorEmit)
        })
      })
    })
  },
  getCurrentSchedule ({ commit, dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      $nuxt.$api.get('https://server13.yesdok.com/api/3.0/doctor/check/schedule', {
        headers: {
          DeviceType: 'web',
          Authorization: 'Bearer ' + state.user.Token
        }
      })
        .then(function (response) {
          const res = response.data

          if (res && typeof res !== 'undefined' && res != null && res.Data && res.Data[0]) {
            res.Data[0].RefundAmount100Percent = Math.round(res.Data[0].Price * 100 / 100)
            res.Data[0].RefundAmount90Percent = Math.round(res.Data[0].Price * 90 / 100)

            let remain = res.Data[0].Price - res.Data[0].RefundAmount90Percent

            res.Data[0].DoctorCommission = Math.round(remain * 80 / 100)
            res.Data[0].AdministrationFee = Math.round(remain * 20 / 100)

            commit('SET_CURRENT_SCHEDULE', res.Data[0])
            // dispatch('setScheduleTimer', (res.Data[0].Start - $nuxt.$moment().unix()) * 1000, { root: true })
            // dispatch('setExpiredConsultationTimer', (res.Data[0].Start + (rootState.consultation.expiredConsultationTime / 1000) - $nuxt.$moment().unix()) * 1000, { root: true })
          } else {
            commit('SET_CURRENT_SCHEDULE', null)
          }

          resolve(res)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  },
  getServerTime ({ rootState }) {
    return new Promise((resolve, reject) => {
      $nuxt.$api.get(process.env.BASE_API + 'doctor/time/server', {}, {
        headers: {
          DeviceType: 'web',
          Authorization: 'Bearer ' + state.user.Token
        }
      }).then((response) => {
        if (response.data && response.data.Data) { resolve(response.data.Data.Time) }
      }).catch((error) => {
        reject(error)
      })
    })
  },
  // log ({ commit, dispatch, state, rootState }, payload) {
  //   const {data, status = 'INFO', consoleLog = true} = payload
  //   return new Promise((resolve, reject) => {
  //     // if(!rootState.globalSocket.isSocketConnected) {
  //     //   console.log('Global Socket Not Connected')
  //     //   reject('Global Socket Not Connected')
  //     // }
  //     let message = `[${$nuxt.$moment().format('YYYY-MM-DD HH:mm:ss')}] [${status}] ${data}`
  //     if(consoleLog) console.log(message)
  //     // dispatch(
  //     //   '$nuxtSocket/emit',
  //     //   {
  //     //     label: rootState.globalSocket.socketPersistName,
  //     //     evt: 'DoctorPracticeSessionLogs',
  //     //     msg: {
  //     //       sessionId: state.doctorSessionID,
  //     //       tokenLoginId: rootState.user.auth.token,
  //     //       message: message
  //     //     }
  //     //   }, { root: true }
  //     // ).then((resEmit) => {
  //     //   console.log('[CONSULTATION LOG]', data)
  //     //   resolve(true)
  //     // }).catch((errorEmit) => {
  //     //   console.log('[LOGGIN FAILED]', data)
  //     //   reject(errorEmit)
  //     // })
  //   })
  // },
  setScheduleTimer ({ commit, dispatch, state }, epochTime) {
    let curr = epochTime

    // get server time
    dispatch('getServerTime', {}, { root: true }).then((response) => {
      const localTime = Date.now()
      const serverTime = response * 1000

      if (localTime > serverTime) { curr += parseFloat(localTime) - parseFloat(serverTime) } else if (localTime < serverTime) { curr -= parseFloat(serverTime) - parseFloat(localTime) }

      if (curr >= 0) {
        let seconds = Math.floor((curr % (1000 * 60)) / 1000)
        let minutes = Math.floor((curr % (1000 * 60 * 60)) / (1000 * 60))
        let hours = Math.floor((curr % (1000 * 60 * 60 * 60)) / (1000 * 60 * 60))
        let days = Math.floor((curr % (1000 * 60 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24))
        let weeks = Math.floor((curr % (1000 * 60 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24 * 7))

        if (minutes < 10) { minutes = '0' + minutes }
        if (seconds < 10) { seconds = '0' + seconds }

        if (state.scheduleTimer.counterIntervalObject) { clearInterval(state.scheduleTimer.counterIntervalObject) }

        commit('SET_SCHEDULE_TIMER', {
          key: 'epochTimer',
          value: curr
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'timerSeconds',
          value: seconds
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'timerMinutes',
          value: minutes
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'timerHours',
          value: hours
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'timerDays',
          value: days
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'timerWeeks',
          value: weeks
        })

        commit('SET_SCHEDULE_TIMER', {
          key: 'counterIntervalObject',
          value: setInterval(() => {
            curr -= 1000

            seconds = Math.floor((curr % (1000 * 60)) / 1000)
            minutes = Math.floor((curr % (1000 * 60 * 60)) / (1000 * 60))
            hours = Math.floor((curr % (1000 * 60 * 60 * 60)) / (1000 * 60 * 60))
            days = Math.floor((curr % (1000 * 60 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24))
            weeks = Math.floor((curr % (1000 * 60 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24 * 7))

            if (minutes < 10) { minutes = '0' + minutes }
            if (seconds < 10) { seconds = '0' + seconds }

            commit('SET_SCHEDULE_TIMER', {
              key: 'epochTimer',
              value: curr
            })

            commit('SET_SCHEDULE_TIMER', {
              key: 'timerSeconds',
              value: seconds
            })

            commit('SET_SCHEDULE_TIMER', {
              key: 'timerMinutes',
              value: minutes
            })

            commit('SET_SCHEDULE_TIMER', {
              key: 'timerHours',
              value: hours
            })

            commit('SET_SCHEDULE_TIMER', {
              key: 'timerDays',
              value: days
            })

            commit('SET_SCHEDULE_TIMER', {
              key: 'timerWeeks',
              value: weeks
            })

            if (curr < 0) {
              dispatch('clearScheduleTimer')
            }
          }, 1000)
        })
      }
    })
  },
  setQueue ({ commit, state, rootState }, token) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()

      // object current schedule from parameter in library SDK and required
      formData.append('CalendarID', state.currentSchedule.PublicID)
      if (state.currentSchedule.Appointment) { formData.append('AppointmentPublicID', state.currentSchedule.Appointment.PublicID) }

      $nuxt.$api.post('https://server13.yesdok.com/api/3.0/doctor/enter/queue', formData, {})
        .then(function (response) {
          console.log(response)
          const res = response.data.Data
          commit('SET_DOCTOR_SESSION_ID', res.DoctorSessionID)
          resolve(res)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  },
  sendPushNotifiation ({ state }) {
    return new Promise((resolve, reject) => {
      $nuxt.$api.post(BASE_API + 'doctor/send/push/call/' + state.doctorSessionID, {})
        .then(function (response) {
          const res = response.data
          resolve(res)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
}
