import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export const handler = async (event: any): Promise<any> => {
    const queueUrl: string = process.env.ORDER_QUEUE_URL || '';

    if (queueUrl.length) {
        const sqsClient: any = new SQSClient({
            region: 'us-east-1',
        });

        const data: string = event.body || '';

        const messageParams: any = {
            MessageBody: data,
            QueueUrl: queueUrl,
        };

        try {
            const response: any = await sqsClient.send(new SendMessageCommand(messageParams));
            console.log('Message sent successfully:', response.MessageId);

            return {
                statusCode: 200,
                body: `Message sent successfully: ${response.MessageId}`,
            };
        } catch (error: any) {
            console.error('Error sending message:', error);

            return {
                statusCode: 403,
                body: `Error sending message: ${error.message}`,
            };
        }
    } else {
        console.log('Queue Url is not present');
        return {
            statusCode: 200,
            body: 'Queue Url is not present',
        };
    }
};
