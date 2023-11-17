import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient: any = new DynamoDBClient({ region: 'us-east-1' });
const  client: any = DynamoDBDocumentClient.from(dynamoDBClient);

const OrdersTableName: string = process.env.ORDER_TABLE_NAME ? process.env.ORDER_TABLE_NAME : "";

export const handler = async (event: any): Promise<any> => {
    event.validationOutput = JSON.parse(JSON.stringify(event.validationOutput));

    try {
        const result: any = await Promise.all([createOrderEntry(event)]);
        console.log('result', result);
        const orderArray: any = Array.from({ length: event.validationOutput.order_quantity }, () => ({
            "order_id": event.validationOutput.order_id,
            "order_quantity": 1,
            "product_id": event.validationOutput.product_id
        }));
        return {
            TaskToken: event.TaskToken,
            orderArray
        };
    } catch (error: any) {
        console.error('Error:', error);
        return {
            TaskToken: event.TaskToken,
            orderArray: []
        };
    }
};

const createOrderEntry = (event: any) => {
    return new Promise(async (res: any, rej: any)=>{
        try{
            const dynamoDBParams: any = {
                TableName: OrdersTableName,
                Item: event.validationOutput,
            };
            console.log('dynamoDBParams', dynamoDBParams);
    
            const putCommand: any = new PutCommand(dynamoDBParams);
            await client.send(putCommand);
    
            console.log('Successfully stored data in DynamoDB');
            res({
                statusCode: 200,
            });
        } catch (error) {
            console.error('Error processing a record:', error);
            res({
                statusCode: 400,
            });
        }
    });
};