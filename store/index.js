export const state = () => ({
  user: {
    Role: '',
    Token: 'H2pYnpTGNrPKT7yt6Fb2wBWQDT4UEVeJVTfWtrCqcsCzo2SopBxdAGNElCcuAFva',
    TokenType: ''
  },
  socket: {
    PersistName: ''
  }
})

export const mutations = {
  SET_USER(state, data) {
    state.user = data
  },
  SET_SOCKET_PERSIST(state, data) {
    state.socket.PersistName = data
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
  }
}
