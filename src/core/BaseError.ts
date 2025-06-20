const ERROR_MESSAGE = {
  UNKNOWN: 'UNKNOWN',
  SQL_ERROR: 'Sql Parse Error',
  ROW_KEY_NOT_DEFINED: 'Row Key is not defined',
  COLUMN_NOT_FOUND: 'Column is not found',
  DATEBASE_FILE_EXISTS: 'DateBase File already exists', // (SQLITE CREATE)
  FILE_NOT_FOUND: 'File not found',

  STRICT_CONDITION_ERROR: 'All argument must match the condition',
  PARAM_ERROR: 'Parameter Error',
  ENV_NOT_PROVIDED: 'Environment Variable Not Provided',
  // VALIDATE_ERROR: 'Validate Erro',
  // AUTH_ERROR: 'Auth Error',
  // PERMISSION_ERROR: 'Permission Error',
  // NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  // CONFLICT_ERROR: 'CONFLICT_ERROR',
  // INTERNAL_ERROR: 'INTERNAL_ERROR',

} as const;

type ErrorCode = keyof typeof ERROR_MESSAGE;

export const ERROR_CODE = {} as Record<ErrorCode, ErrorCode>;

for (const key in ERROR_MESSAGE) ERROR_CODE[key] = key;


interface BaseErrorOptions extends ErrorOptions {
  message?: string;
}



export class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: Date;
  public readonly cause?: Error;

  constructor(code: ErrorCode, options?: BaseErrorOptions) {
    super(options?.message || ERROR_MESSAGE[code], options);
    this.code = code;
    this.timestamp = new Date();

    // 确保 instanceof 检查正常工作
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  /**
   * 获取异常堆栈信息
   */
  getStackTrace(): string {
    return this.stack || '';
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      cause: this.cause,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}
