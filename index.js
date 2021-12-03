const AWS = require('aws-sdk')

const api = new AWS.ApiGatewayManagementApi({
  endpoint: '6jpn0ivmf6.execute-api.us-east-2.amazonaws.com/production'
})

exports.handler = async (event) => {
    // TODO implement
    console.log('got event');
    console.log(event);
    const route = event.requestContext?.routeKey;
    const connectionId = event.requestContext?.connectionId;
    switch(route) {
        case '$connect':
            console.log('connected');
            break;
        case '$disconnect':
            console.log('disconnected');
            break;
        case '$default':
        case 'message':
            console.log('message receive ');
            await replyToMessage('sending rsp ' + new Date().toISOString(), connectionId)
            break;
        default:
            console.log('unknown route ' + route);
        break;
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda sms puller!'),
    };
    return response;
};

async function replyToMessage(response, connectionId) {
    const data = { message: response }
    const params = {
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(data))
    }

    return api.postToConnection(params).promise()
}