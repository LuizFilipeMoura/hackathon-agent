import { sum, subtract, multiply, divide, exponentiate, sqrt, bhaskara, sin, cos, tan, factorial, calculatePercentage } from './operations';

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
    it('should solve quadratic equation with integer roots', () => {
      // x² - 5x + 6 = 0 (roots: 2 and 3)
      const result = bhaskara(1, -5, 6);
      expect(result.x1).toBe(3);
      expect(result.x2).toBe(2);
    });

    it('should solve quadratic equation with decimal roots', () => {
      // x² - 3x + 2 = 0 (roots: 2 and 1)
      const result = bhaskara(1, -3, 2);
      expect(result.x1).toBe(2);
      expect(result.x2).toBe(1);
    });

    it('should handle equations with a coefficient other than 1', () => {
      // 2x² - 8x + 6 = 0 (roots: 3 and 1)
      const result = bhaskara(2, -8, 6);
      expect(result.x1).toBe(3);
      expect(result.x2).toBe(1);
    });

    it('should throw error when a is zero', () => {
      expect(() => bhaskara(0, 2, 1)).toThrow('Not a quadratic equation: a cannot be zero');
    });

    it('should throw error when there are no real roots', () => {
      // x² + x + 1 = 0 (no real roots)
      expect(() => bhaskara(1, 1, 1)).toThrow('No real roots: delta is negative');
    });
  });

  describe('sin', () => {
    it('should calculate sine for common angles correctly', () => {
      expect(sin(0)).toBeCloseTo(0);
      expect(sin(30)).toBeCloseTo(0.5);
      expect(sin(45)).toBeCloseTo(0.7071067811865476);
      expect(sin(60)).toBeCloseTo(0.8660254037844386);
      expect(sin(90)).toBeCloseTo(1);
    });

    it('should handle negative angles', () => {
      expect(sin(-30)).toBeCloseTo(-0.5);
      expect(sin(-90)).toBeCloseTo(-1);
    });

    it('should handle angles > 360', () => {
      expect(sin(390)).toBeCloseTo(sin(30));
      expect(sin(450)).toBeCloseTo(sin(90));
    });
  });

  describe('cos', () => {
    it('should calculate cosine for common angles correctly', () => {
      expect(cos(0)).toBeCloseTo(1);
      expect(cos(30)).toBeCloseTo(0.8660254037844386);
      expect(cos(45)).toBeCloseTo(0.7071067811865476);
      expect(cos(60)).toBeCloseTo(0.5);
      expect(cos(90)).toBeCloseTo(0);
    });

    it('should handle negative angles', () => {
      expect(cos(-30)).toBeCloseTo(0.8660254037844386);
      expect(cos(-90)).toBeCloseTo(0);
    });

    it('should handle angles > 360', () => {
      expect(cos(390)).toBeCloseTo(cos(30));
      expect(cos(450)).toBeCloseTo(cos(90));
    });
  });

  describe('tan', () => {
    it('should calculate tangent for common angles correctly', () => {
      expect(tan(0)).toBeCloseTo(0);
      expect(tan(45)).toBeCloseTo(1);
    });

    it('should throw error for undefined tangent values', () => {
      expect(() => tan(90)).toThrow('Tangent is undefined for degrees that are odd multiples of 90');
      expect(() => tan(270)).toThrow('Tangent is undefined for degrees that are odd multiples of 90');
    });

    it('should handle negative angles', () => {
      expect(tan(-45)).toBeCloseTo(-1);
    });

    it('should handle angles > 360', () => {
      expect(tan(405)).toBeCloseTo(1);
      expect(() => tan(450)).toThrow('Tangent is undefined for degrees that are odd multiples of 90');
    });
  });

  describe('factorial', () => {
    it('should calculate factorial for positive integers correctly', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
    });

    it('should handle edge cases', () => {
      expect(factorial(2)).toBe(2);
      expect(factorial(3)).toBe(6);
      expect(factorial(4)).toBe(24);
    });

    it('should throw error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
      expect(() => factorial(-5)).toThrow('Factorial is not defined for negative numbers');
    });

    it('should throw error for non-integer numbers', () => {
      expect(() => factorial(1.5)).toThrow('Factorial is only defined for integers');
      expect(() => factorial(2.7)).toThrow('Factorial is only defined for integers');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate value when given percentage and total', () => {
      const result = calculatePercentage({ percentage: 25, total: 200 });
      expect(result.value).toBe(50);
      expect(result.percentage).toBe(25);
      expect(result.total).toBe(200);
    });

    it('should calculate percentage when given value and total', () => {
      const result = calculatePercentage({ value: 30, total: 150 });
      expect(result.value).toBe(30);
      expect(result.percentage).toBe(20);
      expect(result.total).toBe(150);
    });

    it('should calculate total when given value and percentage', () => {
      const result = calculatePercentage({ value: 45, percentage: 30 });
      expect(result.value).toBe(45);
      expect(result.percentage).toBe(30);
      expect(result.total).toBe(150);
    });

    it('should handle edge cases', () => {
      expect(calculatePercentage({ value: 0, total: 100 }).percentage).toBe(0);
      expect(calculatePercentage({ value: 100, total: 100 }).percentage).toBe(100);
      expect(calculatePercentage({ percentage: 100, total: 50 }).value).toBe(50);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculatePercentage({}))
        .toThrow('Exactly two parameters must be provided');
      expect(() => calculatePercentage({ value: 10 }))
        .toThrow('Exactly two parameters must be provided');
      expect(() => calculatePercentage({ value: 10, percentage: 20, total: 30 }))
        .toThrow('Exactly two parameters must be provided');
    });

    it('should throw error for negative values', () => {
      expect(() => calculatePercentage({ percentage: -10, total: 100 }))
        .toThrow('Percentage cannot be negative');
      expect(() => calculatePercentage({ value: -10, total: 100 }))
        .toThrow('Value cannot be negative');
      expect(() => calculatePercentage({ value: 10, total: -100 }))
        .toThrow('Total cannot be negative');
    });

    it('should throw error for invalid zero cases', () => {
      expect(() => calculatePercentage({ value: 10, percentage: 0 }))
        .toThrow('Percentage cannot be zero when calculating total');
      expect(() => calculatePercentage({ value: 10, total: 0 }))
        .toThrow('Total cannot be zero when calculating percentage');
    });
  });
});