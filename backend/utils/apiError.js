class apiError extends Error{
  constructor(
    statuscode,
    message ="Something went wrong",
    errors = [],
  ){
    super(message)
    this.statuscode = statuscode,
    this.data = null,
    this.message=message,
    this.errors = errors,
    this.success = false

  }
}

export {apiError}