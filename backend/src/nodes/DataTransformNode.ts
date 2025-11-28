import { ExecutionContext } from '../types';

export class DataTransformNode {
  async execute(parameters: any, context: ExecutionContext): Promise<any> {
    const { mapping = {} } = parameters;

    // Simple data transformation based on mapping
    // mapping format: { "outputField": "{{$node.node1.data.inputField}}" }
    const result: any = {};

    for (const [key, value] of Object.entries(mapping)) {
      result[key] = value; // Already evaluated by ExpressionEvaluator
    }

    return result;
  }
}
