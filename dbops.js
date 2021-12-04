const db = require('./db');
const Promise = require('bluebird');

module.exports = {
    getUserByName: async name => await db.getOneByName(process.env.USER_TABLE_NAME || 'BusinessUser-kh7dnrwmljerze6banc6qglajq-staging', 'username', name),
    saveSmsMessages: async msgs => {        
        await Promise.map(msgs, msg => db.addData(process.env.SMS_TABLE_NAME || 'SmsMessages', msg), {concurrency: 5});
    },
    getSmsConvId: async id => await db.getOneByName('SmsConvSocketIds', 'id', id),
    saveSmsConvId: async data => await db.addData('SmsConvSocketIds', data),
    getAllSmsContacted: async onData => {
        return await db.getAll({ TableName: 'SmsContacted'}, onData)
    },
    saveSmsContacted: async data => await db.addData('SmsContacted', data),
}