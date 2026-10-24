import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.

// needs to have the first value be less than the second, and isn't it 
// also supposed to handle all reals (edit; no lol)?
const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.integer()).map(([a, b]) => (a <= b ? [a, b] : [b, a]));;
const intervalList = fc.array(interval);

// Small range, so overlaps, touching ends and integer neighbours come up often.
const smallPoint = fc.integer({ min: -20, max: 20 });
const smallInterval: fc.Arbitrary<Interval> = fc.tuple(smallPoint, smallPoint).map(([a, b]) => (a <= b ? [a, b] : [b, a]));
const smallIntervalList = fc.array(smallInterval, { maxLength: 8 });
 
// Two intervals with a controlled gap: 0 = touching, 1 = integer neighbours, negative = overlapping.
const intervalPair: fc.Arbitrary<[Interval, Interval]> = fc
  .record({ start: smallPoint, len1: fc.nat(5), gap: fc.integer({ min: -3, max: 3 }), len2: fc.nat(5) })
  .map(({ start, len1, gap, len2 }): [Interval, Interval] => {
    const end = start + len1;
    return [[start, end], [end + gap, end + gap + len2]];
  });
 
// Fresh copies, so calls never share tuples with each other.
const clone = (xs: Interval[]): Interval[] => xs.map(([a, b]): Interval => [a, b]);
 
// Closed intervals merge when they overlap or share an endpoint.
const overlapsOrTouches = ([a, b]: Interval, [c, d]: Interval) => Math.max(a, c) <= Math.min(b, d);
 
// Reference oracle with a different algorithm: merge any overlapping pair until nothing changes.
function referenceMerge(xs: Interval[]): Interval[] {
  const acc = clone(xs);
  let changed = true;
  while (changed) {
    changed = false;
    search: for (let i = 0; i < acc.length; i++) {
      for (let j = i + 1; j < acc.length; j++) {
        if (overlapsOrTouches(acc[i], acc[j])) {
          acc[i] = [Math.min(acc[i][0], acc[j][0]), Math.max(acc[i][1], acc[j][1])];
          acc.splice(j, 1);
          changed = true;
          break search;
        }
      }
    }
  }
  return acc.sort((x, y) => x[0] - y[0]);
}

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Pattern: invariant. Outputs are sorted and separated by a real gap (touching intervals must have merged).
  it('consecutive output intervals are strictly separated', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        const out = mergeIntervals(xs);
        for (const [s, e] of out) expect(s).toBeLessThanOrEqual(e);
        for (let i = 0; i + 1 < out.length; i++) {
          expect(out[i][1]).toBeLessThan(out[i + 1][0]);
        }
      }),
    );
  });
 
  // Pattern: invariant. The input is never modified, and the output shares no array or tuple with it.
  it('does not mutate or alias its input', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const snapshot = clone(xs);
        const out = mergeIntervals(xs);
        expect(xs).toEqual(snapshot);
        expect(out).not.toBe(xs);
        for (const o of out) expect(xs.includes(o)).toBe(false);
      }),
    );
  });
 
  // Pattern: algebraic. Merging distributes over concatenation: merge(xs ++ ys) = merge(merge(xs) ++ merge(ys)).
  it('merging the parts then the whole equals merging the whole', () => {
    fc.assert(
      fc.property(smallIntervalList, smallIntervalList, (xs, ys) => {
        const whole = mergeIntervals(clone([...xs, ...ys]));
        const parts = mergeIntervals([...mergeIntervals(clone(xs)), ...mergeIntervals(clone(ys))]);
        expect(parts).toEqual(whole);
      }),
    );
  });
 
  // Pattern: metamorphic. Reordering the input does not change the output.
  it('is independent of input order', () => {
    const listWithPermutation = smallIntervalList.chain(xs =>
      fc.tuple(fc.constant(xs), fc.shuffledSubarray(xs, { minLength: xs.length, maxLength: xs.length })),
    );
    fc.assert(
      fc.property(listWithPermutation, ([xs, shuffled]) => {
        expect(mergeIntervals(clone(shuffled))).toEqual(mergeIntervals(clone(xs)));
      }),
    );
  });
 
  // Pattern: differential. Agrees with a brute-force reference implementation.
  it('matches the reference implementation', () => {
    fc.assert(
      fc.property(smallIntervalList, xs => {
        expect(mergeIntervals(clone(xs))).toEqual(referenceMerge(xs));
      }),
    );
  });
 
  // Pattern: conditional. Two intervals merge if and only if they overlap or touch.
  it('merges two intervals exactly when they overlap or touch', () => {
    fc.assert(
      fc.property(intervalPair, ([p, q]) => {
        const out = mergeIntervals(clone([p, q]));
        const expected: Interval[] = overlapsOrTouches(p, q)
          ? [[Math.min(p[0], q[0]), Math.max(p[1], q[1])]]
          : clone([p, q]).sort((x, y) => x[0] - y[0]);
        expect(out).toEqual(expected);
      }),
    );
  });
});
