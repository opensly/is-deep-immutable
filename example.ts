import { isDeepImmutable, assertImmutable } from './dist/index.js';

// Example usage
const data = {
  users: [
    { id: 1, name: 'Alice', settings: { theme: 'dark' } },
    { id: 2, name: 'Bob', settings: { theme: 'light' } }
  ],
  metadata: new Map([
    ['version', '1.0.0']
  ]),
  tags: new Set(['production', 'stable'])
};

console.log('Original data is immutable:', isDeepImmutable(data)); // false

// Manually freeze for testing
const frozenData = Object.freeze({
  users: Object.freeze(data.users.map(user => Object.freeze({
    ...user,
    settings: Object.freeze(user.settings)
  }))),
  metadata: Object.freeze(data.metadata),
  tags: Object.freeze(data.tags)
});
console.log('Frozen data is immutable:', isDeepImmutable(frozenData)); // true

// Assert immutability (will throw if not immutable)
try {
  assertImmutable(frozenData);
  console.log('✓ Assertion passed');
} catch (error) {
  console.log('✗ Assertion failed:', error.message);
}

// Try to assert on mutable data
try {
  assertImmutable({ mutable: true });
} catch (error) {
  console.log('Expected error:', error.message);
}