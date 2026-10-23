import { describe, expect, it } from 'vitest';
import { calculate } from '../src/services/calculator.js';

describe('calculator safety boundary', () => {
  it('rejects code-like input before evaluation', () => {
    expect(() => calculate('process.exit()')).toThrow('Unsupported expression');
    expect(calculate('(2 + 3) * 4')).toBe(20);
    expect(() => calculate('1 / 0')).toThrow('Division by zero');
  });
});
