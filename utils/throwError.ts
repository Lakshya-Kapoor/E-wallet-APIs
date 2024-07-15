import { customError, defaultError } from "./customError";

export default function throwError(err: any) {
  if (err instanceof customError) {
    return err;
  } else {
    console.log("Logged in throwError: \n", err);
    return new defaultError();
  }
}
