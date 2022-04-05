export const state = () => ({
  user: {
    Role: '',
    Token: 'H2pYnpTGNrPKT7yt6Fb2wBWQDT4UEVeJVTfWtrCqcsCzo2SopBxdAGNElCcuAFva',
    TokenType: ''
  }
})

export const mutations = {
  SET_USER(state, data) {
    state.user = data
  }
}
