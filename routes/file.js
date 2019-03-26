module.exports = [{
    method: 'GET',
    path: '/uploads/{file*}',
    handler: {
        directory: {
            path: 'uploads/'
        }
    },
    config: {
        auth: false,
    },
}, ]