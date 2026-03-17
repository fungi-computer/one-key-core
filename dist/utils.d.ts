import { Result } from './types/result';
export declare const to_result: <T, E = Error>(maybe: {
    error?: E;
    data?: T;
}) => Result<T, E>;
