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
            console.log(token)
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
    user_register: async function ({ dispatch, state }, payload) {

        try {

            const res = await axios.post(getUrl() + '/user/register', payload)

            await dispatch('userdata_store', { data: res.data })

            console.log('LOGIN')

            if (state.socket) {
                state.socket.emit('login', { jwt: state.jwt })
            }

        } catch (error) {
            console.error('Error', error)
            return { error: error.response }
        }

    },
    user_login: async function ({ dispatch, state }, payload) {

        try {
            const res = await axios.post(getUrl() + '/user/login', payload)
            await dispatch('userdata_store', { data: res.data })

            if (process.client && state.socket) {
                state.socket.emit('login', { jwt: state.jwt })
            }
            this.$router.push('/homepage')

        } catch (err) {
            console.error('Error', err.message)
            return err
        }

    },
    userdata_store: function ({ commit, state }, payload) {

        const {token} = payload.data
        commit('SET_STORE', { jwt:token });

    },
}