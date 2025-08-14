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
    throw new Error("Cannot divide by zero");
  }
  return a / b;
};

export const exponentiate = (base: number, exponent: number): number => {
  return Math.pow(base, exponent);
};

export const squareRoot = (n: number): number => {
  if (n < 0) {
    throw new Error("Cannot calculate square root of negative number");
  }
  return Math.sqrt(n);
};