import { ExecutionContext } from '../types';

export class ConditionalNode {
  async execute(parameters: any, _context: ExecutionContext): Promise<any> {
    const { condition, operator = 'equals', value } = parameters;

    if (condition === undefined) {
      throw new Error('Condition is required for Conditional node');
    }

    let result = false;

    switch (operator) {
      case 'equals':
        result = condition == value;
        break;
      case 'not_equals':
        result = condition != value;
        break;
      case 'greater_than':
        result = Number(condition) > Number(value);
        break;
      case 'less_than':
        result = Number(condition) < Number(value);
        break;
      case 'contains':
        result = String(condition).includes(String(value));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return {
      result,
      condition,
      operator,
      value,
    };
  }
}
