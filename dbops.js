const db = require('./db');
const Promise = require('bluebird');

module.exports = {
    getUserByName: async name => await db.getOneByName(process.env.USER_TABLE_NAME || 'BusinessUser-kh7dnrwmljerze6banc6qglajq-staging', 'username', name),
    saveSmsMessage: async msg => {        
        return await db.addData(process.env.SMS_TABLE_NAME || 'SmsMessages', msg);
    },
    updateSmsConvId: async (id, convId) => {
        return await db.updateData(process.env.USER_TABLE_NAME,
            id, 'set smsConvId=:convId', {
                ":convId": convId
        });
    },
}