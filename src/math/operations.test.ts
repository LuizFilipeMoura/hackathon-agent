import { sum, subtract, multiply, divide, exponentiate, sqrt, bhaskara } from './operations';

describe('Calculator Operations', () => {
    describe('sum', () => {
        it('should add two numbers correctly', () => {
            expect(sum(1, 2)).toBe(3);
            expect(sum(-1, 1)).toBe(0);
            expect(sum(0, 0)).toBe(0);
        });
    });

    describe('subtract', () => {
        it('should subtract two numbers correctly', () => {
            expect(subtract(3, 2)).toBe(1);
            expect(subtract(1, 1)).toBe(0);
            expect(subtract(-1, -1)).toBe(0);
        });
    });

    describe('multiply', () => {
        it('should multiply two numbers correctly', () => {
            expect(multiply(2, 3)).toBe(6);
            expect(multiply(-2, 3)).toBe(-6);
            expect(multiply(-2, -3)).toBe(6);
        });
    });

    describe('divide', () => {
        it('should divide two numbers correctly', () => {
            expect(divide(6, 2)).toBe(3);
            expect(divide(-6, 2)).toBe(-3);
            expect(divide(-6, -2)).toBe(3);
        });

        it('should throw error when dividing by zero', () => {
            expect(() => divide(6, 0)).toThrow('Division by zero is not allowed');
        });
    });

    describe('exponentiate', () => {
        it('should calculate power correctly', () => {
            expect(exponentiate(2, 3)).toBe(8);
            expect(exponentiate(3, 2)).toBe(9);
            expect(exponentiate(2, 0)).toBe(1);
        });

        it('should throw error for non-integer exponents', () => {
            expect(() => exponentiate(2, 1.5)).toThrow('Exponent must be an integer');
        });

        it('should throw error for negative exponents', () => {
            expect(() => exponentiate(2, -1)).toThrow('Negative exponents are not supported');
        });
    });

    describe('sqrt', () => {
        it('should calculate square root correctly', () => {
            expect(sqrt(4)).toBe(2);
            expect(sqrt(0)).toBe(0);
            expect(sqrt(2)).toBeCloseTo(1.4142, 4);
        });

        it('should throw error for negative numbers', () => {
            expect(() => sqrt(-1)).toThrow('Square root of negative numbers is not supported');
        });
    });

    describe('bhaskara', () => {
        it('should solve quadratic equation with two distinct real roots', () => {
            // x² - 5x + 6 = 0 (roots: 2 and 3)
            const result = bhaskara(1, -5, 6);
            expect(result.x1).toBe(3);
            expect(result.x2).toBe(2);
            expect(result.discriminant).toBe(1);
        });

        it('should solve quadratic equation with one double root', () => {
            // x² + 2x + 1 = 0 (root: -1 twice)
            const result = bhaskara(1, 2, 1);
            expect(result.x1).toBe(-1);
            expect(result.x2).toBe(-1);
            expect(result.discriminant).toBe(0);
        });

        it('should handle equations with no real roots', () => {
            // x² + 1 = 0 (no real roots)
            const result = bhaskara(1, 0, 1);
            expect(result.x1).toBeNull();
            expect(result.x2).toBeNull();
            expect(result.discriminant).toBeLessThan(0);
        });

        it('should throw error when a is zero', () => {
            expect(() => bhaskara(0, 1, 1))
                .toThrow('Coefficient "a" cannot be zero - not a quadratic equation');
        });

        it('should throw error for non-finite coefficients', () => {
            expect(() => bhaskara(Infinity, 1, 1))
                .toThrow('All coefficients must be finite numbers');
            expect(() => bhaskara(1, NaN, 1))
                .toThrow('All coefficients must be finite numbers');
        });
    });
});