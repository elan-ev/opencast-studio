/**
 * A custom error type that represents bugs: errors that are not expected and
 * that cannot be handled. They are caused by a bug in our code and not by the
 * "world" (e.g. any input). Use the helper functions below to throw this error.
 */
export class Bug extends Error {
  public constructor(msg: string) {
    super(`${msg} (this is a bug in Opencast Studio)`);
    this.name = 'Bug';
  }
}

/** Throws a `Bug` error. Use this function to signal a bug in the code. */
export const bug = (msg: string): never => {
  throw new Bug(msg);
};

/** Like `bug`, but specifically for code paths that should be unreachable. */
export const unreachable = (msg?: string): never => {
  const prefix = 'reached unreachable code';
  throw new Bug(msg === undefined ? prefix : `${prefix}: ${msg}`);
};

/**
 * Asserts that the given value is neither null nor undefined and throws an
 * exception otherwise.
 */
export const notNullable = <T, >(v: T | null | undefined): T => {
  if (v == null) {
    return bug('value was unexpectedly null');
  }

  return v;
};
