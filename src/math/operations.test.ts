import { sum, subtract, multiply, divide, exponentiate, sqrt, bhaskara } from './operations';

describe('Math Operations', () => {
  describe('sum', () => {
    it('should add two positive numbers correctly', () => {
      expect(sum(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(sum(-2, 3)).toBe(1);
      expect(sum(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(sum(0, 5)).toBe(5);
      expect(sum(5, 0)).toBe(5);
      expect(sum(0, 0)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('should subtract two positive numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should handle negative numbers', () => {
      expect(subtract(-2, 3)).toBe(-5);
      expect(subtract(-2, -3)).toBe(1);
    });

    it('should handle zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(0, 0)).toBe(0);
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('should handle negative numbers', () => {
      expect(multiply(-2, 3)).toBe(-6);
      expect(multiply(-2, -3)).toBe(6);
    });

    it('should handle zero', () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(0, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('should divide two positive numbers correctly', () => {
      expect(divide(6, 2)).toBe(3);
    });

    it('should handle negative numbers', () => {
      expect(divide(-6, 2)).toBe(-3);
      expect(divide(-6, -2)).toBe(3);
    });

    it('should handle division by 1', () => {
      expect(divide(5, 1)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero is not allowed');
    });
  });

  describe('exponentiate', () => {
    it('should calculate powers correctly for positive bases and exponents', () => {
      expect(exponentiate(2, 3)).toBe(8); // 2^3 = 8
      expect(exponentiate(3, 2)).toBe(9); // 3^2 = 9
      expect(exponentiate(5, 1)).toBe(5); // 5^1 = 5
    });

    it('should handle zero base', () => {
      expect(exponentiate(0, 3)).toBe(0); // 0^3 = 0
      expect(exponentiate(0, 1)).toBe(0); // 0^1 = 0
    });

    it('should handle zero exponent', () => {
      expect(exponentiate(5, 0)).toBe(1); // 5^0 = 1
      expect(exponentiate(0, 0)).toBe(1); // 0^0 = 1 (mathematical convention)
    });

    it('should handle negative bases', () => {
      expect(exponentiate(-2, 2)).toBe(4);  // (-2)^2 = 4
      expect(exponentiate(-2, 3)).toBe(-8); // (-2)^3 = -8
    });

    it('should throw error for non-integer exponents', () => {
      expect(() => exponentiate(2, 1.5)).toThrow('Exponent must be an integer');
    });

    it('should throw error for negative exponents', () => {
      expect(() => exponentiate(2, -1)).toThrow('Negative exponents are not supported');
    });
  });

  describe('sqrt', () => {
    it('should calculate square root of positive numbers correctly', () => {
      expect(sqrt(9)).toBe(3);
      expect(sqrt(16)).toBe(4);
      expect(sqrt(25)).toBe(5);
    });

    it('should handle zero', () => {
      expect(sqrt(0)).toBe(0);
    });

    it('should handle decimal results', () => {
      expect(sqrt(2)).toBeCloseTo(1.4142135623730951);
      expect(sqrt(3)).toBeCloseTo(1.7320508075688772);
    });

    it('should throw error for negative numbers', () => {
      expect(() => sqrt(-1)).toThrow('Square root of negative numbers is not supported');
      expect(() => sqrt(-4)).toThrow('Square root of negative numbers is not supported');
    });
  });

  describe('bhaskara', () => {
    it('should calculate two distinct real roots correctly', () => {
      expect(bhaskara(1, -5, 6)).toEqual({x1: 3, x2: 2});
      expect(bhaskara(1, -3, 2)).toEqual({x1: 2, x2: 1});
    });

    it('should handle single root case (delta = 0)', () => {
      expect(bhaskara(1, 2, 1)).toEqual({x1: -1, x2: -1});
      expect(bhaskara(1, 4, 4)).toEqual({x1: -2, x2: -2});
    });

    it('should handle negative coefficients', () => {
      expect(bhaskara(-1, 2, -1)).toEqual({x1: 1, x2: 1});
      expect(bhaskara(2, -7, 3)).toEqual({x1: 3, x2: 0.5});
    });

    it('should throw error for non-real roots', () => {
      expect(() => bhaskara(1, 1, 1)).toThrow('No real roots exist');
      expect(() => bhaskara(2, 2, 2)).toThrow('No real roots exist');
    });

    it('should throw error when not a quadratic equation', () => {
      expect(() => bhaskara(0, 1, 1)).toThrow('Not a quadratic equation (a = 0)');
      expect(() => bhaskara(0, 5, 2)).toThrow('Not a quadratic equation (a = 0)');
    });
  });
});