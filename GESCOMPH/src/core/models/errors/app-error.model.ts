export interface AppError {
  type:
    | 'Validation'
    | 'Business'
    | 'Unauthorized'
    | 'Forbidden'
    | 'NotFound'
    | 'Conflict'
    | 'RateLimit'
    | 'Network'
    | 'Unexpected';
  message: string;
  status?: number;
  traceId?: string;
  details?: any;
}
