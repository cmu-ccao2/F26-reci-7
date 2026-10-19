import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
const word = fc
  .array(fc.constantFrom(...ALPHABET), { minLength: 5, maxLength: 5 })
  .map((letters) => letters.join(''));

// frick i didn't set this up before hand and it took me 17 minutes 
// where am i
// what is happening
// despairing

const colors = (result: unknown) => [...(result as Iterable<string>)];

describe('matchGuess', () => {
  it.todo('returns exactly five colors');
  it('returns exactly five colors', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        expect(colors(matchGuess(secret, guess))).toHaveLength(5);
      }),
    );
  });

  it.todo('only uses the colors G, Y, B');
  it.todo('guessing the secret gives all greens');
  it.todo('never credits a letter more times than the secret contains it');
});
