import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const responseMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    return responseMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};
