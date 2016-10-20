//webpack context magic to include all tests we've wrote
const context = require.context('.', true, /^\.\/.*\/.*\.js$/);
context.keys().forEach(context);
module.exports = context;
