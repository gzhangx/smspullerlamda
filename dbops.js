const db = require('./db');
const Promise = require('bluebird');

const userTableName = () => process.env.USER_TABLE_NAME || 'BusinessUser-kh7dnrwmljerze6banc6qglajq-staging';
module.exports = {
    getUserByName: async name => await db.getOneByName(userTableName(), 'username', name),
    saveSmsMessage: async msg => {        
        return await db.addData(process.env.SMS_TABLE_NAME || 'SmsMessages', msg);
    },
    updateSmsConvId: async (id, convId) => {
        return await db.updateData(userTableName(),
            id, 'set smsConvId=:convId', {
                ":convId": convId
        });
    },
    getUserBySmsPhone: async phone => await db.getOneByName(userTableName(), 'asmsPhone', phone),
}