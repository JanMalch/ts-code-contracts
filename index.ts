/**
 * An error thrown by a code contract.
 */
export abstract class ContractError extends Error {}

/**
 * An error thrown, if a precondition for a function or method is not met.
 */
export class PreconditionError extends ContractError {
  constructor(message?: string) {
    super(message);
    this.name = 'PreconditionError';
  }
}

/**
 * An error thrown, if an object is an illegal state.
 */
export class IllegalStateError extends ContractError {
  constructor(message?: string) {
    super(message);
    this.name = 'IllegalStateError';
  }
}

/**
 * An error thrown, if a function or method could not fulfil a postcondition.
 */
export class PostconditionError extends ContractError {
  constructor(message?: string) {
    super(message);
    this.name = 'PostconditionError';
  }
}

/**
 * An error thrown, if an assertion has failed.
 */
export class AssertionError extends ContractError {
  constructor(message?: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Throws a `PreconditionError` if the `condition` is `false`.
 * @param condition the precondition that should be `true`
 * @param message an optional message for the error
 * @throws PreconditionError if the condition is `false`
 * @see PreconditionError
 * @example
 * function myFun(name: string) {
 *   requires(name.length > 10, 'Name must be longer than 10 chars');
 * }
 */
export function requires(
  condition: boolean,
  message = 'Unmet precondition'
): asserts condition {
  if (!condition) {
    throw new PreconditionError(message);
  }
}

/**
 * Returns the given value unchanged if it is not `null` or `undefined`.
 * Throws a `PreconditionError` otherwise.
 * @param value the value that should not be `null` or `undefined`
 * @param message an optional message for the error
 * @throws PreconditionError if the value is `null` or `undefined`
 * @see requires
 * @example
 * function myFun(name: string | null) {
 *   const nameNonNull = requiresNonNullish(name, 'Name must be defined');
 *   nameNonNull.toUpperCase(); // no error!
 * }
 */
export function requiresNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T> {
  requires(isDefined(value), message);
  return value;
}

/**
 * Throws a `IllegalStateError` if the `condition` is `false`.
 * @param condition the condition that should be `true`
 * @param message an optional message for the error
 * @throws IllegalStateError if the condition is `false`
 * @see IllegalStateError
 * @example
 * class Socket {
 *   private isOpen = false;
 *   send(data: Data) {
 *     check(this.isOpen, 'Socket must be open');
 *   }
 * }
 */
export function checks(
  condition: boolean,
  message = 'Callee invariant violation'
): asserts condition {
  if (!condition) {
    throw new IllegalStateError(message);
  }
}

/**
 * Returns the given value unchanged if it is not `null` or `undefined`.
 * Throws a `IllegalStateError` otherwise.
 * @param value the value that should not be `null` or `undefined`
 * @param message an optional message for the error
 * @throws IllegalStateError if the value is `null` or `undefined`
 * @see checks
 * @example
 * class Socket {
 *   data : Data | null = null;
 *   send() {
 *     const dataNonNull = checksNonNullish(this.data, 'Data must be available');
 *     dataNonNull.send(); // no compiler error!
 *   }
 * }
 */
export function checksNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T> {
  checks(isDefined(value), message);
  return value;
}

/**
 * Throws a `PostconditionError` if the `condition` is `false`.
 * @param condition the condition that should be `true`
 * @param message an optional message for the error
 * @throws PostconditionError if the condition is `false`
 * @see PostconditionError
 * @example
 * async function myFun() {
 *   await createPerson({ id: 0, name: 'John' });
 *   const entity = await findById(0); // returns null if not present
 *   ensures(isDefined(entity), 'Failed to persist entity on server');
 * }
 */
export function ensures(
  condition: boolean,
  message = 'Unmet postcondition'
): asserts condition {
  if (!condition) {
    throw new PostconditionError(message);
  }
}

/**
 * Returns the given value unchanged if it is not `null` or `undefined`.
 * Throws a `PostconditionError` otherwise.
 * @param value the value that must not be `null` or `undefined`
 * @param message an optional message for the error
 * @throws PostconditionError if the value is `null` or `undefined`
 * @see ensures
 * @example
 * function myFun(): Person {
 *   createPerson({ id: 0, name: 'John' });
 *   const entity = findById(0); // returns null if not present
 *   return ensuresNonNullish(entity, 'Failed to persist entity on server');
 * }
 */
export function ensuresNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T> {
  ensures(isDefined(value), message);
  return value;
}

/**
 * Throws a `AssertionError` if the `condition` is `false`.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
 * @throws AssertionError if the condition is `false`
 * @see AssertionError
 */
export function asserts(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

/**
 * Returns `true` if the value is not `null` or `undefined`.
 * @param value the given value
 * @example
 * const x: string | null = 'Hello';
 * check(isDefined(x));
 * x.toLowerCase(); // no compiler error!
 */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value != null;
}

/* eslint-disable @typescript-eslint/no-explicit-any, new-cap */

/**
 * Always throws an `IllegalStateError` with the given message.
 * @param message the message for the `IllegalStateError`
 * @throws IllegalStateError in any case
 * @see IllegalStateError
 * @example
 * function myFun(foo: string | null) {
 *   const bar = foo ?? error(PreconditionError, 'Argument may not be null');
 *   const result = bar.length > 0 ? 'OK' : error('Something went wrong!');
 * }
 */
export function error(
  message?: string
): never;

/**
 * Always throws an error of the given type with the given message.
 * @param errorType an error class
 * @param message the error message
 * @throws errorType in any case
 * @see IllegalStateError
 * @example
 * function myFun(foo: string | null) {
 *   const bar = foo ?? error(PreconditionError, 'Argument may not be null');
 *   const result = bar.length > 0 ? 'OK' : error('Something went wrong!');
 * }
 */
export function error(
  errorType: new (...args: any[]) => Error,
  message?: string
): never;

export function error(
  errorType?: string | (new (...args: any[]) => Error),
  message?: string
): never {
  throw errorType == null || typeof errorType === 'string'
    ? new IllegalStateError(errorType)
    : new errorType(message);
}

/* eslint-enable @typescript-eslint/no-explicit-any, new-cap */

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Asserts that a code branch is unreachable. If it is, the compiler will throw a type error.
 * If this function is reached at runtime, an error will be thrown.
 * @param value a value
 * @throws AssertionError in any case
 * @example
 * function myFun(foo: MyEnum): string {
 *   switch(foo) {
 *     case MyEnum.A: return 'a';
 *     case MyEnum.B: return 'b';
 *     default: unreachable(foo);
 *   }
 * }
 */
export function unreachable(value: never): never {
  throw new AssertionError('Reached an unreachable case');
}
