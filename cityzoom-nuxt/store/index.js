import Vue from 'vue'
import state from './state'
import mutations from './mutations'
import actions from './actions/index'

function timeout(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

Vue.use(Vuex)
const createStore = () => {return new Vuex.Store({
    state,
    actions,
    mutations,
    getters:{
    }   
})
}

export default createStore;