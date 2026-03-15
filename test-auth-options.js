const { authOptions } = require('./lib/auth');
console.log('Auth options imported successfully');
console.log('Secret:', authOptions.secret ? 'EXISTS' : 'MISSING');
