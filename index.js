const VERSION = '1.0.0';
//Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

(function() {
    let prevData = {};

    function isDiff(obj1, obj2){
        return JSON.stringify(obj1) !== JSON.stringify(obj2)
    }

    window.setInterval(function () {
        console.log("Check storage")
        const data = localStorage.getItem('persistent_state');
        const type = 'data';

        if(isDiff(prevData, data)){
            console.log('data updated')
            prevData = data;
            browser.runtime.sendMessage({type, data})
                .then(handleSetDataResponse, handleError);
        } else {
            console.log('data not updated')

        }
    }, 5000)

    function handleSetDataResponse(data) {
        console.log("on handleSetDataResponse", data)
    }

    function handleInitResponse(data) {
        console.log("on handleInitResponse", data)
        if(data){
            const oldData = localStorage.getItem('persistent_state');
            if(isDiff(oldData, data)){
                localStorage.setItem('persistent_state', data);
                location.reload();
            }
        } else {
            localStorage.removeItem('persistent_state')
        }
    }

    function handleError(error) {
        console.log(`Error: ${error}`);
    }

    browser.runtime.sendMessage({type: 'init'})
        .then(handleInitResponse, handleError);

}());
