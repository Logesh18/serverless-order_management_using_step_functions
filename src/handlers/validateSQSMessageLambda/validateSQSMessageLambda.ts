import validateData from '../../jsonValidator';
import orderSchema from '../../../models/orderSchema';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event: any) => {
  try {
    const inputData: any = event;
    inputData.order_id = uuidv4();
    console.log('inputData', inputData);
    if (validateData(inputData, orderSchema).valid) {
      console.log('Validation successful');
      return {
        statusCode: 200,
        validationResult: 'success',
        result: inputData,
      };
    } else {
      console.log('Validation failed');
      return {
        statusCode: 400,
        validationResult: 'failed',
        result: null,
      };
    }
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      validationResult: 'failed',
      result: null,
    };
  }
};
