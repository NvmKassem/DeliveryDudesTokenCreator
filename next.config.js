const withTM = require('next-transpile-modules')(['hashconnect']);
const path = require('path')

module.exports = withTM({
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
});