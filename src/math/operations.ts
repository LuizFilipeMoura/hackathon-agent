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

export interface BhaskaraResult {
    x1: number;
    x2: number;
}

export const bhaskara = (a: number, b: number, c: number): BhaskaraResult => {
    if (a === 0) {
        throw new Error('Not a quadratic equation: a cannot be zero');
    }

    const delta = b * b - 4 * a * c;
    if (delta < 0) {
        throw new Error('No real roots: delta is negative');
    }

    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);

    return { x1, x2 };
};

export const sin = (degrees: number): number => {
    // Convert degrees to radians and calculate sine
    return Math.sin(degrees * Math.PI / 180);
};

export const cos = (degrees: number): number => {
    // Convert degrees to radians and calculate cosine
    return Math.cos(degrees * Math.PI / 180);
};

export const tan = (degrees: number): number => {
    // Check for undefined tangent at odd multiples of 90 degrees
    if (degrees % 90 === 0 && degrees % 180 !== 0) {
        throw new Error('Tangent is undefined for degrees that are odd multiples of 90');
    }
    // Convert degrees to radians and calculate tangent
    return Math.tan(degrees * Math.PI / 180);
};

export const factorial = (n: number): number => {
    if (!Number.isInteger(n)) {
        throw new Error('Factorial is only defined for integers');
    }
    if (n < 0) {
        throw new Error('Factorial is not defined for negative numbers');
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
};

export interface PercentageCalculation {
    value?: number;      // x in "x is y% of z"
    percentage?: number; // y in "x is y% of z"
    total?: number;      // z in "x is y% of z"
}

export const calculatePercentage = (params: PercentageCalculation): Required<PercentageCalculation> => {
    const { value, percentage, total } = params;
    const result: Required<PercentageCalculation> = { value: 0, percentage: 0, total: 0 };

    // Validate inputs
    if (Object.keys(params).length !== 2) {
        throw new Error('Exactly two parameters must be provided');
    }

    // Calculate missing value based on provided parameters
    if (percentage !== undefined && total !== undefined) {
        if (percentage < 0) throw new Error('Percentage cannot be negative');
        if (total < 0) throw new Error('Total cannot be negative');
        result.percentage = percentage;
        result.total = total;
        result.value = (percentage / 100) * total;
    } else if (value !== undefined && total !== undefined) {
        if (value < 0) throw new Error('Value cannot be negative');
        if (total < 0) throw new Error('Total cannot be negative');
        if (total === 0) throw new Error('Total cannot be zero when calculating percentage');
        result.value = value;
        result.total = total;
        result.percentage = (value / total) * 100;
    } else if (value !== undefined && percentage !== undefined) {
        if (value < 0) throw new Error('Value cannot be negative');
        if (percentage < 0) throw new Error('Percentage cannot be negative');
        if (percentage === 0) throw new Error('Percentage cannot be zero when calculating total');
        result.value = value;
        result.percentage = percentage;
        result.total = (value * 100) / percentage;
    } else {
        throw new Error('Invalid combination of parameters');
    }

    return result;
};