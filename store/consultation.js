const BASE_API = 'https://server13.yesdok.com/api/3.0/'

export const state = () => ({
	currentSchedule: null,
	doctorSessionID: '',

	patientID: null,
	patientSessionID: null,
	isCalling: false,
	position: null,
	consultation: {
    consultationID: null,
    schedule: null,
    consultationType: null,
    consultationTypeFlag: null,
    userSymptoms: null,
    userSymptomsID: null,
    userSymptomsIcon: null,
    patientPersonalData: null,
    consultationTimer: null,
    lastConsultationTimer: null,
    consultationTimerObject: null,
    runningTime: 0,
    runningTimeObject: null,
    pharmacy: null,
    videoEnabled: true,
    reconnectData: null,
    isTyping: false,
    consultationMode: 'Video', // Video or Phone
    patientInfo: null,
    status: 'Idle',
    chat: [],
    attachment: null
  }
})
export const mutations = {
	SET_CURRENT_SCHEDULE: (state, value) => {
    state.currentSchedule = value
  },
	SET_DOCTOR_SESSION_ID: (state, value) => {
    state.doctorSessionID = value
  },
	SET_PATIENT_ID: (state, value) => {
		state.patientID = value
	},
	SET_PATIENT_SESSION_ID: (state, value) => {
		state.patientSessionID = value
	},
	SET_CALLING: (state, value) => {
		state.isCalling = value
	},
	SET_POSITION: (state, value) => {
		state.position = value
	},
	SET_CONSULTATION: (state, data) => {
		const { key, value } = data
    if (key === 'chat') {
      if (typeof value.index !== 'undefined' && value.index > -1) {
        state.consultation[key][value.index] = value
      } else {
        state.consultation[key].push(value)
      }
    } else { 
      state.consultation[key] = value
    }
	}
}
export const actions = {
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
          dispatch('log', {
            data: 'Doctor Authorized as ' + state.doctorSessionID,
            status: 'INFO',
          })
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
					dispatch('log', {
						data: 'Doctor Authorized as ' + state.doctorSessionID,
						status: 'INFO',
					})
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
	// getServerTime ({ rootState }) {
	// 	return new Promise((resolve, reject) => {
	// 		$nuxt.$api.get(process.env.BASE_API + 'doctor/time/server', {}, {
	// 			headers: {
	// 				DeviceType: 'web',
	// 				Authorization: 'Bearer ' + state.user.Token
	// 			}
	// 		}).then((response) => {
	// 			if (response.data && response.data.Data) { resolve(response.data.Data.Time) }
	// 		}).catch((error) => {
	// 			reject(error)
	// 		})
	// 	})
	// },
	log ({ commit, dispatch, state, rootState }, payload) {
		const {data, status = 'INFO', consoleLog = true} = payload
		return new Promise((resolve, reject) => {
			// if(!rootState.globalSocket.isSocketConnected) {
			//   console.log('Global Socket Not Connected')
			//   reject('Global Socket Not Connected')
			// }
			let message = `[${$nuxt.$moment().format('YYYY-MM-DD HH:mm:ss')}] [${status}] ${data}`
			if(consoleLog) console.log(message)
			// dispatch(
			//   '$nuxtSocket/emit',
			//   {
			//     label: rootState.globalSocket.socketPersistName,
			//     evt: 'DoctorPracticeSessionLogs',
			//     msg: {
			//       sessionId: state.doctorSessionID,
			//       tokenLoginId: rootState.user.auth.token,
			//       message: message
			//     }
			//   }, { root: true }
			// ).then((resEmit) => {
			//   console.log('[CONSULTATION LOG]', data)
			//   resolve(true)
			// }).catch((errorEmit) => {
			//   console.log('[LOGGIN FAILED]', data)
			//   reject(errorEmit)
			// })
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
	checkLoginPatient ({rootState}, appointmentID) {
    return new Promise((resolve, reject) => {
      $nuxt.$api.post(`${BASE_API}doctor/appointment/${appointmentID}/metadata`, null)
        .then(function (response) {
          resolve(response)
        })
        .catch(function (error) {
          reject(error.response)
        })
    })
  },
	// Socket Action here
	onCall ({commit, state}, response) {
		commit('SET_PATIENT_ID', response.PatientID)
		commit('SET_PATIENT_SESSION_ID', response.PatientSessionID)
		commit('SET_CALLING', true)
		commit('SET_POSITION', 3)

		commit('SET_CONSULTATION', {
			key: 'consultationMode',
			value: response.Type
		})
	}
}