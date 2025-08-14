import { sum, subtract, multiply, divide } from './operations';

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
});