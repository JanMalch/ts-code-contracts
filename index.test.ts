import {
  AssertionError,
  asserts,
  checks,
  checksNonNullish,
  ensures,
  ensuresNonNullish,
  error,
  IllegalStateError,
  isDefined,
  PostconditionError,
  PreconditionError,
  requires,
  requiresNonNullish,
  unreachable,
} from './index';

const expectError = (
  fun: () => unknown,
  errorType: new (...args: any[]) => Error,
  message: string
) => {
  try {
    fun();
    fail('Function should never succeed');
  } catch (e) {
    expect(e.name).toBe(errorType.name);
    expect(e.message).toBe(message);
  }
};

describe('contracts', () => {
  const contractTest = (
    contract: (condition: boolean, message?: string) => asserts condition,
    errorType: new (...args: any[]) => Error,
    defaultMessage: string
  ) => {
    describe(contract.name, () => {
      it('should not error if the condition is met', () => {
        expect(() => contract(true)).not.toThrowError();
      });
      it('should throw the associated error if the condition is not met', () => {
        expectError(() => contract(false), errorType, defaultMessage);
      });
      it('should throw the associated error with the given message if the condition is not met', () => {
        expectError(
          () => contract(false, 'Custom message'),
          errorType,
          'Custom message'
        );
      });
    });
  };

  contractTest(requires, PreconditionError, 'Unmet precondition');
  contractTest(checks, IllegalStateError, 'Callee invariant violation');
  contractTest(ensures, PostconditionError, 'Unmet postcondition');
  contractTest(asserts, AssertionError, '');
});

describe('NonNullish contracts', () => {
  const contractTest = (
    contract: <T>(value: T, message?: string) => NonNullable<T>,
    errorType: new (...args: any[]) => Error
  ): void => {
    describe(contract.name, () => {
      it('should not error if the value is defined', () => {
        expect(() => contract('A nice String')).not.toThrowError();
      });
      it('should throw an Error if the value is not defined', () => {
        expectError(
          () => contract(null),
          errorType,
          'Value must not be null or undefined'
        );
      });
    });
  };

  contractTest(requiresNonNullish, PreconditionError);
  contractTest(checksNonNullish, IllegalStateError);
  contractTest(ensuresNonNullish, PostconditionError);
});

describe('error', () => {
  it('should always error', () => {
    expectError(() => error(), IllegalStateError, '');
  });
  it('should error with the given type', () => {
    expectError(() => error(PreconditionError), PreconditionError, '');
  });
  it('should error with the given type and message', () => {
    expectError(
      () => error(PreconditionError, 'Failed!'),
      PreconditionError,
      'Failed!'
    );
  });
  it('should error with the given message', () => {
    expectError(() => error('Failed!'), IllegalStateError, 'Failed!');
  });
});

describe('isDefined', () => {
  it('should return true for defined values', () => {
    expect(isDefined('TypeScript')).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
  });
  it('should return false for null-ish values', () => {
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(false);
  });
});

describe('unreachable', () => {
  it('should always throw an error at runtime', () => {
    expectError(
      () => unreachable(true as never),
      AssertionError,
      'Reached an unreachable case'
    );
  });

  it('should not throw an error when the switch is exhaustive', () => {
    enum MyEnum {
      A,
      B,
    }

    function myFun(foo: MyEnum): string {
      switch (foo) {
        case MyEnum.A:
          return 'a';
        case MyEnum.B:
          return 'b';
        default:
          unreachable(foo);
      }
    }

    expect(() => myFun(MyEnum.A)).not.toThrow();
    expect(() => myFun(MyEnum.B)).not.toThrow();
  });
});

describe('examples', () => {
  it('should help with password validation', () => {
    // create a "nominal" type and a matching type guard

    /** A nominal type. The `_type` property does not exist at runtime. */
    type Nominal<T, D> = { _type: T } & D;
    /** A string that is a valid email address. */
    type Email = Nominal<'email', string>;
    /** A string that is a good password. */
    type Password = Nominal<'password', string>;

    /** Returns `true` if the given value is a valid email address. */
    function isEmail(value: string): value is Email {
      return !!value && value.includes('@');
    }

    /** Returns `true` if the given value meets the requirements. */
    function isGoodPassword(value: string): value is Password {
      return !!value && value.length >= 8;
    }

    // make sure to use the nominal type in later functions
    function insert(email: Email, password: Password): void {}

    // the signup endpoint
    function signUp(email: string, password: string) {
      // use the contracts with your type guards ...
      requires(isEmail(email), 'Value must be a valid email address');
      requires(isGoodPassword(password), 'Password must meet requirements');
      // ... to tell the compiler that email and password are in fact of type Email and Password,
      // so that you can call the insert function!
      insert(email, password);
    }

    expect(() => signUp('type@script.com', 'abc12345')).not.toThrow();
    expectError(
      () => signUp('typescript.com', 'abc12345'),
      PreconditionError,
      'Value must be a valid email address'
    );
    expectError(
      () => signUp('type@script.com', '1234'),
      PreconditionError,
      'Password must meet requirements'
    );
  });
});
