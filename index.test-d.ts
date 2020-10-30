import { expectError, expectType } from 'tsd';
import {
  checks,
  ensures,
  requires,
  isDefined,
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
  const result = value ?? error();
  expectType<string>(result);
}

interface Named {
  name: string;
}

function isNamed(value: any): value is Named {
  return value != null && typeof value.name === 'string';
}

function useIfTypeGuardExample(value: any) {
  const withName = isNamed(value) ? value : error();
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
