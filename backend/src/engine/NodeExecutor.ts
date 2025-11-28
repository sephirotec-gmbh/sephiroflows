/**
 * Node Executor - Routes execution to appropriate node handlers
 */

import { ExecutionContext } from '../types';
import { ManualTriggerNode } from '../nodes/ManualTriggerNode';
import { HttpRequestNode } from '../nodes/HttpRequestNode';
import { DataTransformNode } from '../nodes/DataTransformNode';
import { ConditionalNode } from '../nodes/ConditionalNode';
import { SetVariableNode } from '../nodes/SetVariableNode';
import { SendEmailNode } from '../nodes/SendEmailNode';

export class NodeExecutor {
  private nodeHandlers: Map<string, any>;

  constructor() {
    this.nodeHandlers = new Map();
    this.registerBuiltInNodes();
  }

  private registerBuiltInNodes() {
    this.nodeHandlers.set('trigger.manual', new ManualTriggerNode());
    this.nodeHandlers.set('action.http', new HttpRequestNode());
    this.nodeHandlers.set('transform.data', new DataTransformNode());
    this.nodeHandlers.set('logic.conditional', new ConditionalNode());
    this.nodeHandlers.set('logic.variable', new SetVariableNode());
    this.nodeHandlers.set('action.email', new SendEmailNode());
  }

  async execute(nodeType: string, parameters: any, context: ExecutionContext): Promise<any> {
    const handler = this.nodeHandlers.get(nodeType);
    
    if (!handler) {
      throw new Error(`No handler found for node type: ${nodeType}`);
    }

    return await handler.execute(parameters, context);
  }
}
