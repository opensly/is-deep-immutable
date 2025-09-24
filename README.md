# is-deep-immutable

> TypeScript-first utility to check deep immutability in JavaScript objects

[![npm version](https://img.shields.io/npm/v/is-deep-immutable.svg)](https://www.npmjs.com/package/is-deep-immutable)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Tiny zero-dependency library to detect and assert deep immutability.  
Works with plain objects, arrays, Maps, Sets, Dates, and nested structures.  
Ships with full TypeScript support and ESM-only build.

---

## Features

- **TypeScript-first** — strong type guards like `value is DeepImmutable<T>`
- **Deep immutability checks** — recursive checks across nested structures
- **Helpful errors** — `assertImmutable` shows the exact path of mutability
- **Zero dependencies** — small, fast, tree-shakable
- **Modern packaging** — ESM, Node 18+, Deno, Bun

---

## Install

```sh
npm install is-deep-immutable
```

---

## Usage

```typescript
import { isDeepImmutable, assertImmutable } from 'is-deep-immutable';

const data = {
  users: [{ id: 1, name: 'Alice' }],
  metadata: new Map([['version', '1.0.0']]),
  tags: new Set(['production'])
};

// Check if deeply immutable
console.log(isDeepImmutable(data)); // false

// Manually freeze for testing
const frozen = Object.freeze({
  users: Object.freeze(data.users.map(u => Object.freeze(u))),
  metadata: Object.freeze(data.metadata),
  tags: Object.freeze(data.tags)
});
console.log(isDeepImmutable(frozen)); // true

// Assert immutability (throws if not)
assertImmutable(frozen); // ✓ passes
assertImmutable(data);   // ✗ throws with detailed path
```

---

## API

### `isDeepImmutable(value): boolean`

Type guard that checks if a value is deeply immutable. Returns `true` for primitives and recursively frozen objects.

```typescript
isDeepImmutable(42);                    // true
isDeepImmutable('hello');               // true  
isDeepImmutable({});                    // false
isDeepImmutable(Object.freeze({}));     // true
```

### `assertImmutable(value): asserts value is DeepImmutable<T>`

Asserts that a value is deeply immutable. Throws with the exact path of mutability if not.

```typescript
assertImmutable({ mutable: true });
// Error: Value is not immutable at path "root": Object is not frozen

assertImmutable({ nested: { mutable: true } });  
// Error: Value is not immutable at path "nested": Object is not frozen
```



---

## TypeScript Support

Full TypeScript support with the `DeepImmutable<T>` utility type:

```typescript
type DeepImmutable<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepImmutable<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepImmutable<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
  : T;
```

---

## Supported Types

- **Primitives**: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- **Objects**: Plain objects with recursive property checking
- **Arrays**: Recursive element checking  
- **Maps**: Key and value immutability checking
- **Sets**: Element immutability checking
- **Dates**: Treated as immutable when frozen
- **Circular references**: Handled safely without infinite recursion

---

## License

MIT
