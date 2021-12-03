const db = require('./db');
const Promise = require('bluebird');

module.exports = {
    getUserByName: async name => await db.getOneByName(process.env.USER_TABLE_NAME, 'username', name),
    saveSmsMessages: async msgs => {        
        await Promise.map(msgs, msg => db.addData(process.env.SMS_TABLE_NAME, msg), {concurrency: 5});
    }
}