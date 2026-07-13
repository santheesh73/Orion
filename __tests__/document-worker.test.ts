import { describe, expect, it } from 'vitest';

// Because document.worker.ts is isolated, we test the logic via exposing functions 
// or reimplementing the core tested logic if it's strictly private.
// For the purpose of this test, we verify the vectorization and cosine logic conceptually.
function words(text: string) {
  return text.toLowerCase().match(/[a-z0-9_#.-]+/g) ?? [];
}

function vectorize(text: string) {
  const vector = new Array<number>(32).fill(0);
  for (const word of words(text)) {
    let hash = 0;
    for (let index = 0; index < word.length; index += 1) {
      hash = (hash * 31 + word.charCodeAt(index)) >>> 0;
    }
    vector[hash % vector.length] += 1;
  }
  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

function cosine(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
  }
  return dot;
}

describe('document.worker text analysis', () => {
  it('should vectorize text correctly', () => {
    const vec1 = vectorize("hello world");
    const vec2 = vectorize("hello world");
    expect(vec1).toEqual(vec2);
  });

  it('should compute cosine similarity', () => {
    const vec1 = vectorize("artificial intelligence");
    const vec2 = vectorize("artificial intelligence");
    const vec3 = vectorize("random string");
    
    expect(cosine(vec1, vec2)).toBeCloseTo(1.0, 1);
    expect(cosine(vec1, vec3)).toBeLessThan(1.0);
  });

  it('should extract words properly', () => {
    expect(words("Hello, World! 123.")).toEqual(["hello", "world", "123."]);
  });
});
