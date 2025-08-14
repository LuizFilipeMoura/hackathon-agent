import { sum, subtract, multiply, divide, exponentiate } from './operations';

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
});