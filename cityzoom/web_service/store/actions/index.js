import axios from 'axios'

function getUrl(){
    return process.client ? "http://localhost:8002" : "http://localhost:8002";
}

export default{
    async nuxtServerInit({dispatch}, {req}){
        const cookie = req.headers.cookie
        let jwt;
        if(cookie){
            jwt = cookie.split('; ').find(c => c.startsWith('jwt='))
            if(jwt) 
                jwt = jwt.split("=")[1]
        }
        if (jwt){ await dispatch('renew_data',jwt) }
    },
    renew_data: async function ({ dispatch, state }, payload) {

        try {
            const token = payload;
            const res = await axios({
                method: 'get',
                url: getUrl() + '/user/me',
                headers: {
                    'Authorization': token
                }
            })
            dispatch('userdata_store', { data: res.data })
        } catch (err) {
            console.error('Error', err.message)
            return err.message
        }

    },
    user_register: async function ({ commit, state }, payload) {

        try {

            const res = await axios.post(getUrl() + '/user', payload)
            return {content:'Succesfuly registered, you can now login', username: payload.username}

        } catch (error) {
            console.error('Error', error)
            return 'Username or email already in use!'
        }

    },
    user_login: async function ({ commit, state }, payload) {

        try {
            const res = await axios.post(getUrl() + '/user/login', payload)
            commit('SET_STORE', { jwt: res.data.token });

            if (process.client && state.socket) {
                state.socket.emit('login', { jwt: state.jwt })
            }
            this.$router.push('/homepage')

        } catch (err) {
            return 'Invalid username or password!';
        }

    },
    user_logout: async function ({ commit, state }, payload) {

        try {
            const res = await axios({
                method: 'get',
                url: getUrl() + '/user/logout',
                headers: {
                    'Authorization': state.jwt
                }
            })
            console.log(res)
            commit('SET_STORE', {
                jwt: '',
            })
            this.$router.push('/')
        } catch (err) {
            console.error('Error', err.message)
            return err
        }
        // this.$router.push('/')
        // //some logic here, DELETE COOKIES AND LOCALSTORAGE, also invalidate token

    },
    userdata_store: function ({ commit, state }, payload) {

        const {token} = payload.data
        commit('SET_STORE', { jwt:token });

    },
}