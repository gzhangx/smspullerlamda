const AWS = require('aws-sdk');
const processor = require('./processor');

const api = new AWS.ApiGatewayManagementApi({
  endpoint: '6jpn0ivmf6.execute-api.us-east-2.amazonaws.com/production'
})

function parseBody(body) {
    if (!body) return {
        error:'Null body'
    };
    try {
        return {
            ok: JSON.parse(body),
        }
    } catch {
        return {
            error: `failed to parse body:${body}`,
        }
    }
}
exports.handler = async (event) => {
    // TODO implement
    console.log('got event');
    console.log(event);
    const { routeKey, connectionId } = event.requestContext || {};
    const body = parseBody(event.body);    
    switch (routeKey) {
        case '$connect':
            console.log('connected');
            break;
        case '$disconnect':
            console.log('disconnected');
            break;
        case '$default':
        case 'message':
            console.log(`message receive ${routeKey}`);
            await replyToMessage(body.ok ? await processor.doProcess(body.ok):body, connectionId)
            break;
        default:
            console.log('unknown route ' + routeKey);
        break;
    }
    const response = {
        statusCode: 200,
        body:'done',
    };
    return response;
};

async function replyToMessage(response, connectionId) {
    const params = {
      ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(response))
    }

    return api.postToConnection(params).promise()
}