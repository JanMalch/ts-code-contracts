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

- [`requires` for preconditions](#requires)
  - [`requiresNonNullish` for null-checks as preconditions](#requiresnonnullish)
- [`checks` for invariants](#checks)
  - [`checksNonNullish` for null-checks as invariants](#checksnonnullish)
- [`ensures` for postconditions](#ensures)
  - [`ensuresNonNullish` for null-checks as postconditions](#ensuresnonnullish)
- [`asserts` for impossible events](#asserts)
- [`unreachable` for unreachable code branches](#unreachable)
- [`error` to make code more concise](#error)
- [`isDefined` type guard](#isdefined)

Make sure to checkout the examples in the documentation below
or refer to the [test cases](https://github.com/JanMalch/ts-code-contracts/blob/master/index.test.ts#L133-L163)
and [typing assistance](https://github.com/JanMalch/ts-code-contracts/blob/master/index.test-d.ts#L41-L52)!

Contracts are really just handy shorthands to throw an error, if the given condition is not met.
And yet they greatly help the compiler and the readability of your code.

## `requires`

Use it to validate preconditions, like validating arguments.
Throws a `PreconditionError` if the `condition` is `false`.

```ts
function requires(
  condition: boolean,
  message: string = 'Unmet precondition'
): asserts condition;
```

- `condition` - the condition that should be `true`
- `message` - an optional message for the error

**Example:**

```ts
function myFun(name: string) {
  requires(name.length > 10, 'Name must be longer than 10 chars');
}
```

## `requiresNonNullish`

A variation of `requires` that returns the given value unchanged if it is not `null` or `undefined`.
Throws a `PreconditionError` otherwise.

```ts
function requiresNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T>;
```

- `value` - the value that should not be `null` or `undefined`
- `message` - an optional message for the error

**Example:**

```ts
function myFun(name: string | null) {
  const nameNonNull = requiresNonNullish(name, 'Name must be defined');
  nameNonNull.toUpperCase(); // no compiler error!
}
```

## `checks`

Use it to check for an illegal state.
Throws a `IllegalStateError` if the `condition` is `false`.

```ts
function checks(
  condition: boolean,
  message = 'Callee invariant violation'
): asserts condition;
```

- `condition` - the condition that should be `true`
- `message` - an optional message for the error

**Example:**

```ts
class Socket {
  private isOpen = false;
  send(data: Data) {
    check(this.isOpen, 'Socket must be open');
  }
  open() {
    this.isOpen = true;
  }
}
```

## `checksNonNullish`

A variation of `checks` that returns the given value unchanged if it is not `null` or `undefined`.
Throws a `IllegalStateError` otherwise.

```ts
function checksNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T>;
```

- `value` - the value that should not be `null` or `undefined`
- `message` - an optional message for the error

**Example:**

```ts
class Socket {
  data: Data | null = null;
  send() {
    const validData = checksNonNullish(this.data, 'Data must be available');
    validData.send(); // no compiler error!
  }
}
```

## `ensures`

Use it to verify that your code behaved correctly.
Throws a `PostconditionError` if the `condition` is `false`.

```ts
function ensures(
  condition: boolean,
  message = 'Unmet postcondition'
): asserts condition;
```

- `condition` - the condition that should be `true`
- `message` - an optional message for the error

**Example:**

```ts
function myFun() {
  createPerson({ id: 0, name: 'John' });
  const entity = findById(0); // returns null if not present
  return ensures(isDefined(entity), 'Failed to persist entity');
}
```

## `ensuresNonNullish`

A variation of `ensures` that returns the given value unchanged if it is not `null` or `undefined`.
Throws a `PostconditionError` otherwise.

```ts
function ensuresNonNullish<T>(
  value: T,
  message = 'Value must not be null or undefined'
): NonNullable<T>;
```

- `value` - the value that should not be `null` or `undefined`
- `message` - an optional message for the error

**Example:**

```ts
function myFun(): Person {
  createPerson({ id: 0, name: 'John' });
  const entity = findById(0); // returns null if not present
  return ensuresNonNullish(entity, 'Failed to persist entity');
}
```

## `asserts`

Clarify that you think that the given condition is impossible to happen.
Throws a `AssertionError` if the `condition` is `false`.

```ts
asserts(
  condition: boolean,
  message?: string
): asserts condition;
```

- `condition` - the condition that should be `true`
- `message` - an optional message for the error

## `unreachable`

Asserts that a code branch is unreachable. If it is, the compiler will throw a type error.
If this function is reached at runtime, an error will be thrown.

```ts
function unreachable(
  value: never,
  message = 'Reached an unreachable case'
): never;
```

- `value` - a value
- `message` - an optional message for the error

**Example:**

```ts
function myFun(foo: MyEnum): string {
  switch (foo) {
    case MyEnum.A:
      return 'a';
    case MyEnum.B:
      return 'b';
    // no compiler error if MyEnum only has A and B
    default:
      unreachable(foo);
  }
}
```

## `error`

This function will always throw an error.
It helps keeping code easy to read and come in handy when assigning values with a ternary operator or the null-safe operators.

```ts
function error(message?: string): never;
function error(
  errorType: new (...args: any[]) => Error,
  message?: string
): never;
```

- `errorType` - an error class, defaults to `IllegalStateError`
- `message` - an optional message for the error

**Example:**

```ts
function myFun(foo: string | null) {
  const bar = foo ?? error(PreconditionError, 'Argument may not be null');
  const result = bar.length > 0 ? 'OK' : error('Something went wrong!');
}
```

## `isDefined`

A type guard, to check that a value is not `null` or `undefined`.
Make sure to use [`strictNullChecks`](https://basarat.gitbook.io/typescript/intro/strictnullchecks).

```ts
function isDefined<T>(value: T): value is NonNullable<T>;
```

- `value` - the value to test

**Example:**

```ts
const x: string | null = 'Hello';
if (isDefined(x)) {
  x.toLowerCase(); // no compiler error!
}
```

## Errors

The following error classes are included:

- `PreconditionError` &rarr; An error thrown, if a precondition for a function or method is not met.
- `IllegalStateError` &rarr; An error thrown, if an object is an illegal state.
- `PostconditionError` &rarr; An error thrown, if a function or method could not fulfil a postcondition.
- `AssertionError` &rarr; An error thrown, if an assertion has failed.
