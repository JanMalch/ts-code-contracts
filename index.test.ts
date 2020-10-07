import {
  AssertionError,
  asserts,
  checks,
  ensures,
  error,
  IllegalStateError,
  isDefined,
  PostconditionError,
  PreconditionError,
  requires,
  unreachable,
  useIf,
} from './index';

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
      it('should throw a PreconditionError if the condition is not met', () => {
        expect(() => contract(false)).toThrowError(
          // eslint-disable-next-line new-cap
          new errorType(defaultMessage)
        );
      });
      it('should throw a PreconditionError with the given message if the condition is not met', () => {
        expect(() => contract(false, 'Custom message')).toThrowError(
          // eslint-disable-next-line new-cap
          new errorType('Custom message')
        );
      });
    });
  };

  contractTest(requires, PreconditionError, 'Unmet precondition');
  contractTest(checks, IllegalStateError, 'Callee invariant violation');
  contractTest(ensures, PostconditionError, 'Unmet postcondition');
  contractTest(asserts, AssertionError, 'Failed Assertion');
});

describe('utils', () => {
  describe('error', () => {
    it('should always error', () => {
      expect(() => error()).toThrowError(new IllegalStateError());
    });
    it('should error with the given type', () => {
      expect(() => error(PreconditionError)).toThrowError(
        new PreconditionError()
      );
    });
    it('should error with the given type and message', () => {
      expect(() => error(PreconditionError, 'Failed!')).toThrowError(
        new PreconditionError('Failed!')
      );
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

  describe('useIf', () => {
    interface Named {
      name: string;
    }
    function isNamed(value: any): value is Named {
      return value != null && typeof value.name === 'string';
    }

    it('should return the value if it passes the type guard', () => {
      const input = { name: 'John' };
      const ifIsNamed = useIf(isNamed);
      expect(ifIsNamed(input)).toBe(input);
    });
    it('should throw a PreconditionError by default if the value does not pass the type guard', () => {
      const ifIsNamed = useIf(isNamed);
      expect(() => ifIsNamed(false)).toThrowError(
        new PreconditionError('Unmet precondition')
      );
    });
    it('should use the given contract', () => {
      const ifIsNamed = useIf(isNamed, ensures);
      expect(() => ifIsNamed(false)).toThrowError(
        new PostconditionError('Unmet postcondition')
      );
    });
    it('should use the given message for the contract error', () => {
      const ifIsNamed = useIf(isNamed, ensures, 'Failed!');
      expect(() => ifIsNamed(false)).toThrowError(
        new PostconditionError('Failed!')
      );
    });
  });

  describe('unreachable', () => {
    it('should always throw an error at runtime', () => {
      expect(() => unreachable({} as never)).toThrowError();
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
      expect(() => signUp('typescript.com', 'abc12345')).toThrowError(
        new PreconditionError('Value must be a valid email address')
      );
      expect(() => signUp('type@script.com', '1234')).toThrowError(
        new PreconditionError('Password must meet requirements')
      );
    });
  });
});