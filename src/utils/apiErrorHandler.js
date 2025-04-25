import { isEmpty } from "lodash-es";

export class ApiResponse {
  constructor(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data || {};
  }

  static goodRequest(code, data, msg) {
    return new ApiResponse(code, msg || '', data);
  }

  static badRequest(code, msg, data = {}) {
    return new ApiResponse(code, msg, data);
  }

  static internal(msg) {
    return new ApiResponse(500, msg || 'Внутренняя ошибка сервера');
  }
}


export function apiErrorHandler(err, req, res, next) {
  // in prod, don't use console.log or console.err because
  // it is not async
  // console.error(err);

  if (err instanceof ApiResponse) {
    res.status(err.code).json({
      data: err.data || {},
      feedback: {
        status: err.code,
        method: req.method,
        url: req.originalUrl,
        message: err.code !== 200 && isEmpty(err.data) && isEmpty(err.message) ? 'Произошла непредвиденная ошибка. Обратитесь в техподдержку.' : err.message,
      },
    });
    return;
  }

  res.status(500).json("Внутренняя ошибка сервера");
}
