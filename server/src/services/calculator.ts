const operators: Record<string, { precedence: number; apply: (a: number, b: number) => number }> = {
  '+': { precedence: 1, apply: (a, b) => a + b },
  '-': { precedence: 1, apply: (a, b) => a - b },
  '*': { precedence: 2, apply: (a, b) => a * b },
  '/': { precedence: 2, apply: (a, b) => { if (b === 0) throw new Error('Division by zero'); return a / b; } }
};

export function calculate(expression: string): number {
  if (expression.length > 200 || !/^[0-9+\-*/().\s]+$/.test(expression)) throw new Error('Unsupported expression');
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? [];
  if (tokens.join('') !== expression.replace(/\s/g, '')) throw new Error('Unsupported expression');
  const values: number[] = [];
  const ops: string[] = [];
  const reduce = () => { const op = ops.pop(); const b = values.pop(); const a = values.pop(); if (!op || a === undefined || b === undefined) throw new Error('Invalid expression'); values.push(operators[op].apply(a, b)); };
  for (const token of tokens) {
    if (/^\d/.test(token)) { const value = Number(token); if (!Number.isFinite(value) || Math.abs(value) > 1e12) throw new Error('Number out of range'); values.push(value); continue; }
    if (token === '(') { ops.push(token); continue; }
    if (token === ')') { while (ops.at(-1) && ops.at(-1) !== '(') reduce(); if (ops.pop() !== '(') throw new Error('Invalid expression'); continue; }
    const top = ops.at(-1);
    while (top && top !== '(' && operators[top].precedence >= operators[token].precedence) reduce();
    ops.push(token);
  }
  while (ops.length) { if (ops.at(-1) === '(') throw new Error('Invalid expression'); reduce(); }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error('Invalid expression');
  return values[0];
}
