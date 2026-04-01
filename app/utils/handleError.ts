import {type AxiosError, isAxiosError} from "axios";

export function getErrorMessageAxios(error: unknown): string {
    if (isAxiosError(error)) {
        return (error as AxiosError<BaseResponse<null>>).response?.data?.message || error.message;
    } else {
        return 'An unexpected error occurred.';
    }
}