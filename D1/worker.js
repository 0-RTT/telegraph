import { handleRequest } from './function.js';

var src_default = {
  async fetch(request, env) {
    const { DATABASE } = env;

    // 处理请求
    return handleRequest(request, DATABASE, env);
  }
};

export {
  src_default as default
};
