function ID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}


function getData() {
    console.log("getData")
    return browser.storage.sync.get('app')
        .then(({ app = { users: [], currentUser: undefined } }) => {
            return app;
        })
}

function setData(app) {
    console.log("setData", app)
    return browser.storage.sync.set({ app })
}

function addUser() {
    console.log("addUser", getData)
    return getData()
        .then((app) => {
            app.users.push({
                id: ID()
            });
            return app;
        })
        .then(setData)
}

function setCurrentUser(userId) {
    console.log("setCurrentUser", userId)
    return getData()
        .then((app) => {
            app.currentUser = userId;
            return app;
        })
        .then(setData)
}

function getCurrentUser(userId) {
    console.log("getCurrentUser", userId)
    return getData()
        .then(({ currentUser }) => {
            return currentUser;
        })
}

export {
    getData,
    setData,
    addUser,
    setCurrentUser,
    getCurrentUser
}