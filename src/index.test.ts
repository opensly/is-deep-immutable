import { describe, it, expect } from 'vitest';
import { isDeepImmutable, assertImmutable } from './index.js';

describe('isDeepImmutable', () => {
  it('should return true for primitives', () => {
    expect(isDeepImmutable(42)).toBe(true);
    expect(isDeepImmutable('hello')).toBe(true);
    expect(isDeepImmutable(null)).toBe(true);
    expect(isDeepImmutable(undefined)).toBe(true);
  });

  it('should return false for mutable objects', () => {
    expect(isDeepImmutable({})).toBe(false);
    expect(isDeepImmutable([])).toBe(false);
    expect(isDeepImmutable({ a: 1 })).toBe(false);
  });

  it('should return true for frozen objects', () => {
    const obj = Object.freeze({ a: Object.freeze({ b: 1 }) });
    expect(isDeepImmutable(obj)).toBe(true);
    
    const arr = Object.freeze([Object.freeze({ a: 1 })]);
    expect(isDeepImmutable(arr)).toBe(true);
  });

  it('should handle Maps and Sets', () => {
    const frozenMap = Object.freeze(new Map([['key', Object.freeze({ value: 1 })]]));
    expect(isDeepImmutable(frozenMap)).toBe(true);
    
    const frozenSet = Object.freeze(new Set([Object.freeze({ item: 1 })]));
    expect(isDeepImmutable(frozenSet)).toBe(true);
  });
});

describe('assertImmutable', () => {
  it('should throw on mutable objects', () => {
    expect(() => {
      assertImmutable({ a: 1 });
    }).toThrow(/Value is not immutable/);
  });

  it('should pass on immutable objects', () => {
    const frozen = Object.freeze({ a: Object.freeze({ b: 1 }) });
    expect(() => {
      assertImmutable(frozen);
    }).not.toThrow();
  });

  it('should provide detailed error paths', () => {
    expect(() => {
      assertImmutable({ nested: { mutable: true } });
    }).toThrow('Value is not immutable at path "root": Object is not frozen');
  });
});

