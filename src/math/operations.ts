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

export const sqrt = (a: number): number => {
    if (a < 0) {
        throw new Error('Square root of negative numbers is not supported');
    }
    return Math.sqrt(a);
};

export const bhaskara = (a: number, b: number, c: number): { x1: number | null, x2: number | null, discriminant: number } => {
    if (a === 0) {
        throw new Error('Coefficient "a" cannot be zero - not a quadratic equation');
    }

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
        throw new Error('All coefficients must be finite numbers');
    }

    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
        return {
            x1: null,
            x2: null,
            discriminant: discriminant
        };
    }
    
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const x1 = (-b + sqrtDiscriminant) / (2 * a);
    const x2 = (-b - sqrtDiscriminant) / (2 * a);
    
    return {
        x1: x1,
        x2: x2,
        discriminant: discriminant
    };
};