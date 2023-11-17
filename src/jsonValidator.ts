import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

const validateData = (data: any, schema: any) => {
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    return { valid: isValid, result: isValid ? data : validate.errors };
};
  
export default validateData;