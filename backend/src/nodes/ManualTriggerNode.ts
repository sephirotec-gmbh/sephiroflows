import { ExecutionContext } from '../types';

export class ManualTriggerNode {
  async execute(_parameters: any, context: ExecutionContext): Promise<any> {
    // Manual trigger just passes through the trigger data
    return {
      data: context.triggerData,
      timestamp: new Date().toISOString(),
    };
  }
}
