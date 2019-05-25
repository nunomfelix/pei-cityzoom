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

    renew_data: async function ({ commit, state }, payload) {

        try {
            const res = await axios({
                method: 'get',
                url: getUrl() + '/user/me',
                headers: {
                    'Authorization': payload
                }
            })
            const verticals = await axios({
                method: 'get',
                url: getUrl() + '/vertical',
                headers: {
                    'Authorization': payload
                }
            })
            commit('SET_STORE', { user: { ...res.data}, jwt: payload, verticals: verticals.data })
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
            commit('SET_STORE', { errorMessage:'Username or email already in use!' });
            console.error('Error', error)
            return 'Username or email already in use!'
        }

    },
    user_login: async function ({ commit, state }, payload) {

        try {
            const res = await axios.post(getUrl() + '/user/login', payload)
            const {jwt, ...user} = res.data
            commit('SET_STORE', { user, jwt });

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
                usera: '',
                jwt: ''
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
    get_streams: async function ({ commit, state }, payload) {
        try {
            const res = await axios({
                method: 'get',
                url: getUrl() + '/stream',
                headers: {
                    'Authorization': state.jwt
                }
            })
            commit('STREAMS_UPDATE', res)
            return res.data.user_streams

        } catch (err) {
            console.error('Error', err.message)
            return err
        }
    },
    get_stream_values: async function ({ commit, state }, payload) {
        try {
            const res = await axios({
                method: 'get',
                url: getUrl() + '/stream/' + payload.name+'/values',
                headers: {
                    'Authorization': state.jwt
                }
            })
            commit('STREAMS_UPDATE_VALUES', { name: payload.name, values: res.data.values })
            return res.data.values

        } catch (err) {
            console.error('Error', err.message)
            return err
        }
    }
}