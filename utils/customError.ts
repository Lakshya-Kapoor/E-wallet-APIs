export class customError extends Error {
  constructor(public status: number, public message: string) {
    super();
    this.status = status;
    this.message = message;
  }
}

export class databaseError extends customError {
  constructor(public message: string = "Database Error") {
    super(500, message);
  }
}

export class defaultError extends customError {
  constructor() {
    super(500, "Internal server error");
  }
}
