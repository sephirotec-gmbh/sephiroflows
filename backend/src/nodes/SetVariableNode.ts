import { ExecutionContext } from '../types';

export class SetVariableNode {
  async execute(parameters: any, context: ExecutionContext): Promise<any> {
    const { name, value } = parameters;

    if (!name) {
      throw new Error('Variable name is required for Set Variable node');
    }

    // Store in context variables
    context.variables[name] = value;

    return {
      name,
      value,
      set: true,
    };
  }
}
