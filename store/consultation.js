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
  },
	callStatus: null,
	iceCandidates: []
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
	},
	SET_CALL_STATUS: (state, value) => {
    state.callStatus = value
  },
	ADD_NEW_CANDIDATE: (state, value) => {
		state.iceCandidates.push(value)
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
	},
	emitCall ({ commit, dispatch, rootState }, data) {
		const {sdp} = data
		dispatch(
			'$nuxtSocket/emit',
      {
        label: rootState.practiceSocket.PersistName,
        evt: 'Call',
        msg: { id: 'Call', sdpOffer: sdp }
      }, { root: true }
		)
	},
	emitMessage ({ commit, dispatch, rootState }, data) {
    dispatch(
      '$nuxtSocket/emit',
      {
        label: rootState.practiceSocket.PersistName,
        evt: 'Message',
        msg: data
      }, { root: true }
    ).then((resEmit) => {
      console.log('Emit Message: ' + JSON.stringify(data))
    }).catch((errorEmit) => {
      console.log('Emit Message Failed')
    })
  },
	onMessage ({ commit, dispatch, state }, response) {
    console.log('On Message: ' + JSON.stringify(response.data))

    if (response.id == 'ProcessedAnswer') { $nuxt.$emit('setPeerSignal', 'sdp', response.data) }

    if (response.id == 'IceCandidate') { $nuxt.$emit('setPeerSignal', 'candidate', response.data) }

    if (response.CallType) {
			console.log('Consultation Call Type: ' + response.CallType)

      commit('SET_CONSULTATION', {
        key: 'consultationMode',
        value: response.CallType
      })

      if (response.CallType == 'Video' || response.CallType == 'Chat') {
        commit('SET_CONSULTATION', {
          key: 'videoEnabled',
          value: true
        })
      }
      if (response.CallType == 'Audio') {
        commit('SET_CONSULTATION', {
          key: 'videoEnabled',
          value: false
        })
      }
    }

    // if (response.id == 'IsTyping') {
    //   dispatch('log', {
    //     data: 'Consultation Chat is Typing...',
    //     status: 'INFO',
    //   })
    //   commit('SET_CONSULTATION', {
    //     key: 'isTyping',
    //     value: true
    //   })

    //   setTimeout(() => {
    //     commit('SET_CONSULTATION', {
    //       key: 'isTyping',
    //       value: false
    //     })
    //     dispatch('log', {
    //       data: 'Consultation Chat Stop Typing',
    //       status: 'INFO',
    //     })
    //   }, 2000)
    // }

    if (response.Status) {
      if(state.consultation.status === 'PatientDisconnect' && response.Status === 'DeviceBackToForeground') {
        commit('SET_CONSULTATION', {
          'key': 'status',
          'value': state.consultation.status,
        })
        // dispatch('log', {
        //   data: 'Consultation Status: ' + state.consultation.status,
        //   status: 'INFO',
        // })
      } else {
        commit('SET_CONSULTATION', {
          'key': 'status',
          'value': response.Status,
        })
        // dispatch('log', {
        //   data: 'Consultation Status: ' + response.Status,
        //   status: 'INFO',
        // })
      }
    }
  },
	async onData ({ commit, dispatch, state, rootState }, response) {
    // dispatch('clearMissedCallTimeout')

    // dispatch('log', {
    //   data: 'On Data: ' + JSON.stringify(response),
    //   status: 'INFO',
    // })
		console.log('On Data', JSON.stringify(response))

    if (response.Status != 'Accepted') {
      // $nuxt.$emit('patientRejectCall')
      // dispatch('log', {
      //   data: 'Patient Reject The Call',
      //   status: 'INFO',
      // })
    } else {
      await dispatch('initConsultation').then((response) => {
        // langkah 16
        state.iceCandidates.forEach((iceCandidate) => {
          dispatch('emitMessage', { id: 'IceCandidate', data: iceCandidate })
        })
				console.log('set call status')
        commit('SET_CALLING', false)
        commit('SET_CALL_STATUS', 'IN_CALL')
        // commit('SET_IN_CONSULTATION', true)

        commit('SET_CONSULTATION', {
          key: 'status',
          value: 'Connected'
        })
				console.log('patient accept call, in consultation')
        // dispatch('log', {
        //   data: 'Patient Accept The Call',
        //   status: 'INFO',
        // })
        // dispatch('log', {
        //   data: 'In Consultation',
        //   status: 'INFO',
        // })
      })
    }
  },
	initConsultation ({ commit, dispatch, state, rootState }) {
    // langkah 17
    return new Promise((resolve, reject) => {
			console.log('masuk init consultation')
      // let willCreateConsult = true

      // if (state.consultation.status === 'DoctorReconnect') {
      //   commit('SET_RECORDED', state.consultation.reconnectData.Practicing.IsRecorded)
      //   commit('SET_CONSULTATION', {
      //     key: 'consultationID',
      //     value: state.consultation.reconnectData.Practicing.ID
      //   })
      //   commit('SET_CONSULTATION', {
      //     key: 'userSymptoms',
      //     value: state.consultation.reconnectData.Practicing.SymptomNotes
      //   })
      //   commit('SET_CONSULTATION', {
      //     key: 'userSymptomsID',
      //     value: state.consultation.reconnectData.Practicing.SymptomID
      //   })
      //   commit('SET_CONSULTATION', {
      //     key: 'userSymptomsIcon',
      //     value: state.consultation.reconnectData.Practicing.SymptomIcon
      //   })
      //   commit('SET_CONSULTATION', {
      //     key: 'pharmacy',
      //     value: state.consultation.reconnectData.Practicing.pharmacy
      //   })

      //   dispatch('$nuxtSocket/emit', {
      //     label: state.socketPersistName,
      //     evt: 'ConsultationID',
      //     msg: state.consultation.reconnectData.Practicing.ID
      //   }, { root: true }
      //   )
      //   dispatch('emitMessage', { id: 'ConsultationID', data: state.consultation.reconnectData.Practicing.ID })
      // }

      // dispatch('log', {
      //   data: 'Current Status while Init Consultation: ' + state.consultation.status,
      //   status: 'INFO',
      // })
      // dispatch('log', {
      //   data: 'Consultation ID: ' + state.consultation.consultationID,
      //   status: 'INFO',
      // })

      // check current practice is exist
      $nuxt.$api.get(BASE_API + 'doctor/' + 'current/practice/' + rootState.doctorSessionID)
        .then(function (response) {
					console.log('masuk then init consultation')
          const resCheckPractice = response.data

          if (!resCheckPractice || resCheckPractice.status === 204) {
            dispatch('log', {
              data: 'Create Practicing Data...',
              status: 'INFO',
            })

            const formData = {
              DoctorSessionID: rootState.doctorSessionID,
              PatientSessionID: state.patientSessionID,
              PatientID: state.patientID
            }

            $nuxt.$api.post(BASE_API + 'doctor/' + 'create/consultation', formData)
              .then(function (response) {
                const res = response.data.Data

                // commit('SET_RECORDED', res.IsRecorded)
                commit('SET_CONSULTATION', {
                  key: 'consultationID',
                  value: res.ID
                })

                dispatch('$nuxtSocket/emit', {
                  label: rootState.practiceSocket.PersistName,
                  evt: 'ConsultationID',
                  msg: res.ID
                }, { root: true }
                )
                // dispatch('getPatientInfoByConsultationID')
                // dispatch('startTimer')
                // dispatch('getChatHistories')
                resolve(true)
              })
              .catch(function (error) {
                reject(error)
              })
            return
          }

          // dispatch('log', {
          //   data: 'Practicing Data Found',
          //   status: 'INFO',
          // })

          const data = resCheckPractice.Data

          // commit('SET_RECORDED', data.IsRecorded)
          commit('SET_CONSULTATION', {
            key: 'consultationID',
            value: data.ID
          })
          commit('SET_CONSULTATION', {
            key: 'userSymptoms',
            value: data.SymptomNotes
          })
          commit('SET_CONSULTATION', {
            key: 'userSymptomsID',
            value: data.Symptoms
          })
          commit('SET_CONSULTATION', {
            key: 'pharmacy',
            value: data.PharmacyID
          })

          dispatch('$nuxtSocket/emit', {
            label: rootState.practiceSocket.PersistName,
            evt: 'ConsultationID',
            msg: data.ID
          }, { root: true }
          )
          dispatch('emitMessage', { id: 'ConsultationID', data: data.ID })
          // dispatch('getPatientInfoByConsultationID')
          // dispatch('startTimer')
          // dispatch('getChatHistories')
					console.log('init consult success')
          resolve(true)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  },
}