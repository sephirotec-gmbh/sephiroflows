/**
 * Expression Evaluator for SephiroFlows
 * Evaluates expressions like {{$node.node1.data.field}} and {{$trigger.data.field}}
 */

import { ExecutionContext } from '../types';

export class ExpressionEvaluator {
  private context: ExecutionContext;

  constructor(context: ExecutionContext) {
    this.context = context;
  }

  /**
   * Evaluate a value that may contain expressions
   */
  evaluate(value: any): any {
    if (typeof value === 'string') {
      return this.evaluateString(value);
    } else if (Array.isArray(value)) {
      return value.map((item) => this.evaluate(item));
    } else if (value && typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        result[key] = this.evaluate(value[key]);
      }
      return result;
    }
    return value;
  }

  /**
   * Evaluate expressions in a string
   */
  private evaluateString(str: string): any {
    // Check if the entire string is a single expression
    const singleExprMatch = str.match(/^\{\{(.+?)\}\}$/);
    if (singleExprMatch) {
      return this.evaluateExpression(singleExprMatch[1].trim());
    }

    // Replace all expressions in the string
    return str.replace(/\{\{(.+?)\}\}/g, (match, expr) => {
      const result = this.evaluateExpression(expr.trim());
      return result !== undefined ? String(result) : match;
    });
  }

  /**
   * Evaluate a single expression
   */
  private evaluateExpression(expr: string): any {
    // Handle $node.nodeId.data.path
    if (expr.startsWith('$node.')) {
      const parts = expr.substring(6).split('.');
      const nodeId = parts[0];
      const path = parts.slice(1);
      return this.getNestedValue(this.context.nodeOutputs[nodeId], path);
    }

    // Handle $trigger.path
    if (expr.startsWith('$trigger.')) {
      const path = expr.substring(9).split('.');
      return this.getNestedValue(this.context.triggerData, path);
    }

    // Handle $variables.name
    if (expr.startsWith('$variables.')) {
      const varName = expr.substring(11);
      return this.context.variables[varName];
    }

    // Handle functions
    if (expr.startsWith('$')) {
      return this.evaluateFunction(expr);
    }

    // Return the expression as-is if not recognized
    return expr;
  }

  /**
   * Get nested value from an object using dot notation
   */
  private getNestedValue(obj: any, path: string[]): any {
    let current = obj;
    for (const key of path) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }

  /**
   * Evaluate built-in functions
   */
  private evaluateFunction(func: string): any {
    // $now()
    if (func === '$now()') {
      return new Date().toISOString();
    }

    // $uppercase(value)
    const uppercaseMatch = func.match(/^\$uppercase\((.+)\)$/);
    if (uppercaseMatch) {
      const value = this.evaluateExpression(uppercaseMatch[1].trim());
      return typeof value === 'string' ? value.toUpperCase() : value;
    }

    // $lowercase(value)
    const lowercaseMatch = func.match(/^\$lowercase\((.+)\)$/);
    if (lowercaseMatch) {
      const value = this.evaluateExpression(lowercaseMatch[1].trim());
      return typeof value === 'string' ? value.toLowerCase() : value;
    }

    // $length(value)
    const lengthMatch = func.match(/^\$length\((.+)\)$/);
    if (lengthMatch) {
      const value = this.evaluateExpression(lengthMatch[1].trim());
      if (Array.isArray(value)) return value.length;
      if (typeof value === 'string') return value.length;
      if (value && typeof value === 'object') return Object.keys(value).length;
      return 0;
    }

    // $json(value) - parse JSON string
    const jsonMatch = func.match(/^\$json\((.+)\)$/);
    if (jsonMatch) {
      const value = this.evaluateExpression(jsonMatch[1].trim());
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    // Return undefined for unknown functions
    return undefined;
  }
}
