import axios, { AxiosRequestConfig } from 'axios';
import { ExecutionContext } from '../types';

export class HttpRequestNode {
  async execute(parameters: any, context: ExecutionContext): Promise<any> {
    const { method = 'GET', url, headers = {}, body, timeout = 30000 } = parameters;

    if (!url) {
      throw new Error('URL is required for HTTP Request node');
    }

    try {
      const config: AxiosRequestConfig = {
        method: method.toUpperCase(),
        url,
        headers,
        timeout,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        config.data = body;
      }

      const response = await axios(config);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: true,
        };
      }
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  }
}
