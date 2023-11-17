const orderSchema: any = {
  type: 'object',
  properties: {
    order_id: { type: 'string' },
    order_quantity: { type: 'number', minimum: 1 },
    product_id: { type: 'string' },
  },
  required: ['order_id', 'order_quantity', 'product_id'],
  additionalProperties: false,
};
  
export default orderSchema;