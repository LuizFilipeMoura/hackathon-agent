export const sum = (a: number, b: number): number => {
    return a + b;
};

export const subtract = (a: number, b: number): number => {
    return a - b;
};

export const multiply = (a: number, b: number): number => {
    return a * b;
};

export const divide = (a: number, b: number): number => {
    if (b === 0) {
        throw new Error('Division by zero is not allowed');
    }
    return a / b;
};

export const exponentiate = (base: number, exponent: number): number => {
    // Handle special cases
    if (!Number.isInteger(exponent)) {
        throw new Error('Exponent must be an integer');
    }
    
    if (exponent < 0) {
        throw new Error('Negative exponents are not supported');
    }
    
    // x^0 = 1 for any x
    if (exponent === 0) {
        return 1;
    }
    
    return Math.pow(base, exponent);
};

export const squareRoot = (n: number): number => {
    if (n < 0) {
        throw new Error('Cannot calculate square root of negative numbers');
    }
    return Math.sqrt(n);
};