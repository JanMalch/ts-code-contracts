# ts-code-contracts <a href="https://www.github.com/JanMalch/ts-code-contracts"><img src="https://user-images.githubusercontent.com/25508038/63974103-75242700-caac-11e9-8ca4-71cc5b905e90.png" width="90" height="90" align="right"></a>

[![npm](https://badgen.net/bpm/v/ts-code-contracts)](https://www.npmjs.com/package/ts-code-contracts)
[![Build](https://github.com/JanMalch/ts-code-contracts/workflows/Build/badge.svg)](https://github.com/JanMalch/ts-code-contracts/workflows/Build)
[![coverage](https://img.shields.io/badge/coverage-100%25-success)](https://github.com/JanMalch/ts-code-contracts/blob/master/jest.config.js#L14-L17)
[![minified + gzip](https://badgen.net/bundlephobia/minzip/ts-code-contracts)](https://bundlephobia.com/result?p=ts-code-contracts)

_Design by contract with TypeScript._

## Installation & Usage

```
npm i ts-code-contracts
```

> Requires TypeScript^3.7

You can now import the following functions `from 'ts-code-contracts'`:

- Contracts
  - [`requires` for preconditions](#requires)
  - [`checks` for illegal states](#checks)
  - [`ensures` for postconditions](#ensures)
  - [`unreachable` for unreachable code branches](#unreachable)
  - [`asserts` for any other assertion](#asserts)
- Utils
  - [`error` to make code more concise](#error)
  - [`isDefined` type guard](#isdefined)

Make sure to read the `@example`s in the documentation below
or refer to the [test cases](https://github.com/JanMalch/ts-code-contracts/blob/master/index.test.ts#L166-L196)
and [typing assistance](https://github.com/JanMalch/ts-code-contracts/blob/master/index.test-d.ts#L54-L65)!

## Contracts

The following functions are the core of this library.
They are just handy shorthands to throw an error, if the given condition is not met.
And yet they greatly help the compiler and the readability of your code. Make sure to fail fast!

### `requires`

Use it for preconditions, like validating arguments.

```ts
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
  message: string = 'Unmet precondition'
): asserts condition;
```

#### `requiresNonNullish`

A variation of `requires` that will either return the value if it's defined, or throw if it isn't.

```ts
/**
 * Requires the given value not to be `null` or `undefined`, otherwise a `PreconditionError` will be thrown.
 * @param value the value that must not be `null` or `undefined`
 * @param message an optional message for the error
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
): NonNullable<T>;
```

### `checks`

Use it to check for an illegal state.

```ts
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
  message: string = 'Callee invariant violation'
): asserts condition;
```

#### `checksNonNullish`

A variation of `checks` that will either return the value if it's defined, or throw if it isn't.

```ts
/**
 * Checks that the given value is not `null` or `undefined`, otherwise a `IllegalStateError` will be thrown.
 * @param value the value that must not be `null` or `undefined`
 * @param message an optional message for the error
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
): NonNullable<T>;
```

### `ensures`

Use it to verify that your code behaved correctly.

```ts
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
  message: string = 'Unmet postcondition'
): asserts condition;
```

#### `ensuresNonNullish`

A variation of `ensures` that will either return the value if it's defined, or throw if it isn't.

```ts
/**
 * Ensures that the given value is not `null` or `undefined`, otherwise a `PostconditionError` will be thrown.
 * @param value the value that must not be `null` or `undefined`
 * @param message an optional message for the error
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
): NonNullable<T>;
```

### `unreachable`

Use it to assert that a code branch is unreachable.

```ts
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
export function unreachable(_value: never): never;
```

### `asserts`

Use it for any other assertions, that don't quite fit the other contexts.

```ts
/**
 * Asserts that the given condition is met, if not a `AssertionError` will be thrown.
 * @param condition the condition that must be `true`
 * @param message an optional message for the error
 * @see AssertionError
 */
export function asserts(
  condition: boolean,
  message: string = 'Failed Assertion'
): asserts condition;
```

## Utils

The following functions do help you write even more concise code.

### `error`

This function will always throw the given error and helps keeping code easy to read.

```ts
/**
 * Always throws an error of the given type with the given message.
 * It can come in handy when assigning values with a ternary operator or the null operators.
 * @param errorType an error class, defaults to `AssertionError`
 * @param message the error message
 * @see IllegalStateError
 * @example
 * function myFun(foo: string | null) {
 *   const bar = foo ?? error(PreconditionError, 'Argument may not be null');
 *   const result = bar.length > 0 ? 'OK' : error();
 * }
 */
export function error(
  errorType: new (...args: any[]) => Error = IllegalStateError,
  message?: string
): never;
```

### `isDefined`

A common type guard, to check that a value is defined.
Make sure to use [`strictNullChecks`](https://basarat.gitbook.io/typescript/intro/strictnullchecks).

```ts
/**
 * Type guard to check if the given value is not nullable.
 * @param value the given value
 * @example
 * const x: string | null = 'Hello';
 * check(isDefined(x));
 * x.toLowerCase(); // no error!
 */
export function isDefined<T>(value: T): value is NonNullable<T>;
```

## Errors

The following error classes are included:

- `PreconditionError` &rarr; An error thrown, if a precondition for a function or method is not met.
- `IllegalStateError` &rarr; An error thrown, if an object is an illegal state.
- `PostconditionError` &rarr; An error thrown, if a function or method could not fulfil a postcondition.
- `AssertionError` &rarr; An error thrown, if an assertion has failed.
