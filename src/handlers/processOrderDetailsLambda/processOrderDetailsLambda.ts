import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
let dynamoDBClient: any = new DynamoDBClient({ region: 'us-east-1' });
const client: any = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event: any, context: any) => {
  console.log('event---->', event);
  const { product_id }: { product_id: string } = event;
  try {
    const getItemParams: any = {
      TableName: process.env.STOCKS_TABLE_NAME,
      Key: {
        product_id
      }
    };

    const getCommand: any = new GetCommand(getItemParams);

    const result: any = await client.send(getCommand);

    const currentStockQuantity: number = parseInt(result.Item.quantity);

    const decrementQuantity: number = Math.min(currentStockQuantity, 1);
    console.log('decrementQuantity---->', decrementQuantity);
    if (decrementQuantity > 0) {
        const newQuantity: number = currentStockQuantity - 1;
        const updateParams: any = {
            TableName: process.env.STOCKS_TABLE_NAME,
            Key: {
              product_id
            },
            UpdateExpression: 'SET #quantity = :newQuantity',
            ExpressionAttributeNames: { '#quantity': 'quantity' },
            ExpressionAttributeValues: { ':newQuantity': newQuantity }
        };         
          

      const updateItemCommand: any = new UpdateCommand(updateParams);

      await client.send(updateItemCommand);

      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    console.error('Error:', error);

    return false;
  }
};
