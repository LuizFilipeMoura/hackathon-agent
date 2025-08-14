import { sum, subtract, multiply, divide, exponentiate, squareRoot } from './operations';

describe('Math Operations', () => {
  describe('sum', () => {
    it('should add two numbers correctly', () => {
      expect(sum(2, 3)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(6, 2)).toBe(3);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Cannot divide by zero');
    });
  });

  describe('exponentiate', () => {
    it('should calculate power correctly', () => {
      expect(exponentiate(2, 3)).toBe(8);
    });

    it('should handle zero exponent', () => {
      expect(exponentiate(5, 0)).toBe(1);
    });
  });

  describe('squareRoot', () => {
    it('should calculate square root correctly', () => {
      expect(squareRoot(9)).toBe(3);
      expect(squareRoot(16)).toBe(4);
    });

    it('should handle zero', () => {
      expect(squareRoot(0)).toBe(0);
    });

    it('should throw error for negative numbers', () => {
      expect(() => squareRoot(-4)).toThrow('Cannot calculate square root of negative number');
    });
  });
});