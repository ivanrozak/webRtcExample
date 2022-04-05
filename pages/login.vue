<template>
  <div>
    <h1>Login</h1>
    <input type="text" placeholder="email" v-model="email">
    <input type="text" placeholder="password" v-model="password">
    <button @click="login">Login</button>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    login() {
      const formData = {
        Email: this.email,
        Password: this.password
      }
      axios.post('https://server13.yesdok.com/api/3.0/' + 'doctoradmin/login', formData, {
        headers: {
          DeviceType: 'web'
        }
      }).then((res) => {
        const result = res.data.Data
        this.$store.commit('SET_USER', result)
        this.$router.push('/')
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>
