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
 * Requires the given condition to be met, if not a `PreconditionError` will be thrown.
 * Use it to verify argument values.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
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
 * Checks that the given condition is met, if not a `IllegalStateError` will be thrown.
 * Use it to verify that the object is in a correct state.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
 * @see IllegalStateError
 * @example
 * class Socket {
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
 * Ensures that the given condition is met, if not a `PostconditionError` will be thrown.
 * Use it to verify that your function behaved correctly.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
 * @see PostconditionError
 * @example
 * async function myFun() {
 *   await post({ id: 0, name: 'John' });
 *   const entity = await get(0);
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
 * Asserts that the given condition is met, if not a `AssertionError` will be thrown.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
 * @see AssertionError
 */
export function asserts(
  condition: boolean,
  message = 'Failed Assertion'
): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

/**
 * Type guard to check if the given value is not nullable.
 * @param value the given value
 * @example
 * const x: string | null = 'Hello';
 * check(isDefined(x));
 * x.toLowerCase(); // no error!
 */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value != null;
}

/**
 * Returns a function that will return the passed in value, if it passes the given type guard.
 * If not, the given contract will throw an error with the given message.
 * @param predicate the type guard that the value must pass
 * @param contract the contract for context
 * @param contractMessage the message for the contract
 * @example
 * function myFun(foo: string | null) {
 *   const bar = useIf(isDefined)(foo);
 * }
 */
export function useIf<T, U extends T = T>(
  predicate: (value: T | U) => value is U,
  contract: (
    condition: boolean,
    message?: string
  ) => asserts condition = requires,
  contractMessage?: string
): (value: T | U) => U {
  return (value: T | U): U => {
    contract(predicate(value), contractMessage);
    return value;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any, new-cap */

/**
 * Always throws an error of the given type with the given message.
 * It can come in handy when assigning values with a ternary operator or the null operators.
 * @param errorType an error class, defaults to `AssertionError`
 * @param message the error message
 * @see AssertionError
 * @example
 * function myFun(foo: string | null) {
 *   const bar: string = foo ?? error(PreconditionError, 'Argument may not be null');
 *   const result = bar.length > 0 ? 'OK' : error('Something went wrong!');
 * }
 */
export function error<T>(
  errorType: new (...args: any[]) => Error = AssertionError,
  message?: string
): T {
  throw new errorType(message);
}

/* eslint-enable @typescript-eslint/no-explicit-any, new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Asserts that a code branch is unreachable. If it is, the compiler will throw a type error.
 * If this function is reached at runtime, an error will be thrown.
 * @param _value a value
 * @example
 * function myFun(foo: MyEnum): string {
 *   switch(foo) {
 *     case MyEnum.A: return 'a';
 *     case MyEnum.B: return 'b';
 *     default: unreachable(foo);
 *   }
 * }
 */
export function unreachable(_value: never): never {
  throw new Error('Reached an unreachable case');
}
