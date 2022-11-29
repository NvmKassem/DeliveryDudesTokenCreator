const withTM = require('next-transpile-modules')(['hashconnect']);
const path = require('path')

module.exports = withTM({
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
});
