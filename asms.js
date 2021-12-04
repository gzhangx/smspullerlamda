const AWS = require('aws-sdk');
// The AWS Region that you want to use to send the message. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/.
const aws_region = "us-east-1";
AWS.config.update({ region: aws_region });


async function sendMessage(originationNumber = '+18558021929', destinationNumber, message, senderId) {
    const applicationId = 'acfb7b22914444be85bd4e50529a2909';    

    const messageType = "TRANSACTIONAL";

    const registeredKeyword = "myKeyword";

    const pinpoint = new AWS.Pinpoint();

    const params = {
        ApplicationId: applicationId,
        MessageRequest: {
            Addresses: {
                [destinationNumber]: {
                    ChannelType: 'SMS'
                }
            },
            MessageConfiguration: {
                SMSMessage: {
                    Body: message,
                    Keyword: registeredKeyword,
                    MessageType: messageType,
                    OriginationNumber: originationNumber,
                    SenderId: senderId,
                }
            }
        }
    };

    return new Promise((resolve, reject) => pinpoint.sendMessages(params, function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
            //console.log("Message sent! "
            //    + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
        }
    }));
}