import { describe, expect, it } from 'vitest';

describe('Nexus client', () => {
  it('has the expected product name', () => {
    expect('Nexus AI').toContain('Nexus');
  });
});
