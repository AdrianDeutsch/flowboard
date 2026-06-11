/**
 * Error type carrying an HTTP status code.
 * Services throw HttpError for expected failure cases (404, 409, …);
 * the global error handler converts it into a clean JSON response.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message = 'Bad request') {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new HttpError(409, message);
  }
}
