import Cookie from 'js-cookie'

function storeMessage(state,data) {
    const { sender, destination } = data
    if(!state._id , !sender || !destination) return;
    if(sender == state._id) {
        state.messages[destination] = destination in state.messages 
                    ? state.messages[destination].concat([data]) 
                    : [data] 
    } else {   
        state.messages[sender] = sender in state.messages 
                    ? state.messages[sender].concat([data]) 
                    : [data]
    }
}


export default {
    SET_STORE: (state , transObject) => {
        state.modifier++;
        Object.keys(transObject).forEach(key => { 
            
            if(!process.server && ['jwt'].includes(key)) {
                Cookie.set(key, transObject[key])
                localStorage.setItem(key,transObject[key])
            }
            if(key in state)
                state[key] = transObject[key] 
            else
                console.log('Discarted', key)
                
        })
    },
    MARK_AS_READ(state,_id) {
        try {
            state.modifier++;
            for(const message of state.messages[_id]) {
                if(message.destination==state._id && !message.read) {
                    console.log('altering this');
                    message.read = true;  
                }                 
            }
            console.log('messages',state.messages)
        } catch(ex) {
            console.error(ex.message)
        }
    },
    START_CHAT(state,_id) {
        if(!state.messages[_id])
            state.messages[_id] = []
    },
    STORE_MESSAGE(state,data) {
        state.modifier++;
        storeMessage(state,data);
    },
    socket_connect(state,data) {
        console.log('CONNECTED')
       
        state.socket = this._vm.$socket
        let jwt = state.jwt;
        if(jwt != '') state.socket.emit('login',{jwt})
    },
    socket_newmessage(state,data) {
        state.modifier++;
        const {message} = data
        if(message)
            storeMessage(state,message);
    },
    socket_update(state, message) {
        console.log('socket_update', message);
        state.modifier++;
    },
    STREAMS_UPDATE(state, streams) {
        state.streams = [...streams.data.user_streams]
    },
    STREAMS_UPDATE_VALUES(state, data) {
        state.streams.find(s => s.name == data.name)['values'] = data.values
    }
}
