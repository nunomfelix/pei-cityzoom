export default async function(context) {
    const { state } = context.store
    const paths = ['/', '/login', '/register']
    console.log("tmp")
    if(paths.includes(context.route.path)) {
        if(state.jwt) {
            context.redirect('/homepage')
        }
    } else if(state.jwt) {
        await context.store.dispatch('renew_data', state.jwt)
    } else {
        context.redirect('/')
    }
}