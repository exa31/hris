export class HttpError extends Error {
    public status: number;
    public code: string;
    public data?: any;

    constructor(status: number, code: string, message?: string, data?: any) {
        super(message ?? code ?? 'error');
        this.status = status;
        this.code = code;
        this.data = data;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

