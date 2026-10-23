import { describe, expect, it } from 'vitest';

function safeArithmetic(input: string): number {
  if (!/^[0-9+\-*/().\s]+$/.test(input) || input.length > 200) throw new Error('Unsupported expression');
  const tokens = input.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? [];
  if (tokens.join('') !== input.replace(/\s/g, '')) throw new Error('Unsupported expression');
  const values = tokens.filter((token) => /^\d/.test(token)).map(Number);
  if (values.some((value) => !Number.isFinite(value) || Math.abs(value) > 1e12)) throw new Error('Number out of range');
  throw new Error('Calculator evaluator not wired');
}

describe('calculator safety boundary', () => {
  it('rejects code-like input before evaluation', () => {
    expect(() => safeArithmetic('process.exit()')).toThrow('Unsupported expression');
    expect(() => safeArithmetic('1 + 2')).toThrow('Calculator evaluator not wired');
  });
});
