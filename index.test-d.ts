import { expectError, expectType } from 'tsd';
import {
  checks,
  ensures,
  requires,
  isDefined,
  useIf,
  error,
  asserts,
  unreachable,
} from './index';

// CONTRACTS

function requiresExample(value: string | null) {
  requires(isDefined(value));
  expectType<string>(value);
}

function checksExample(value: string | null) {
  checks(isDefined(value));
  expectType<string>(value);
}

function ensuresExample(value: string | null) {
  ensures(isDefined(value));
  expectType<string>(value);
}

function assertsExample(value: string | null) {
  asserts(isDefined(value));
  expectType<string>(value);
}

// UTILS

function errorExample(value: string | null) {
  // error cannot help the compiler to infer the type
  const result = value ?? error();
  expectError<string>(result);
  expectType<string | null>(result);
  // to help the compiler, you can use it like this ...
  const foo: string = value ?? error();
  expectType<string>(foo);
  // ... or like this
  const bar = value ?? error<string>();
  expectType<string>(bar);
}

function useIfExample(value: string | null) {
  expectType<string>(useIf(isDefined)(value));
}

interface Named {
  name: string;
}

function isNamed(value: any): value is Named {
  return value != null && typeof value.name === 'string';
}

function useIfTypeGuardExample(value: any) {
  const withName = useIf(isNamed)(value);
  expectType<Named>(withName);
}

function exhaustiveSwitch(foo: 'a' | 'b'): void {
  let x;
  switch (foo) {
    case 'a':
      x = 0;
      break;
    case 'b':
      x = 1;
      break;
    default:
      unreachable(foo);
  }
  expectType<number>(x);
}
