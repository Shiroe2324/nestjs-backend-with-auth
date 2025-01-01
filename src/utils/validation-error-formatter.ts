import { ValidationError } from '@nestjs/common';

export const validationErrorFormatter = (errors: ValidationError[]) => {
  return errors.map((error) => ({ field: error.property, content: Object.values(error.constraints || {}).join(', ') }));
};
