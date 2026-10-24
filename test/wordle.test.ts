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
  // it.todo('returns exactly five colors');
  // Pattern: invariant. The result always returns 5 colours
  it('returns exactly five colors', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        expect(colors(matchGuess(secret, guess))).toHaveLength(5);
      }),
    );
  });

  // it.todo('only uses the colors G, Y, B');
  // Pattern: invariant. The result is always made up of G, Y, B
  it('only uses the colors G, Y, B', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        for (const color of colors(matchGuess(secret, guess))) {
          expect(['G', 'Y', 'B']).toContain(color);
        }
        // expect(
        //   for (color in colors(matchGuess(secret, guess))) {
        //     color in ['G', 'Y', 'B'];
        //   }
        // );
      }),
    )
  })

  // it.todo('guessing the secret gives all greens');
  // Pattern: conditional. If the guess = secret, then the result should be all Greens
  it('guessing the secret gives all greens', () => {
    fc.assert(
      fc.property(word, w => {
        expect(matchGuess(w, w)).toEqual(['G', 'G', 'G', 'G', 'G']);
      })
        // expect(
        //   for (color in colors(matchGuess(secret, guess))) {
        //     color in ['G', 'Y', 'B'];
        //   }
        // );
    )
  })

  // it.todo('never credits a letter more times than the secret contains it');
  // Pattern: invariant. The result never credits a letter more times than the secret contains it
  it('never credits a letter more times than the secret contains it', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        const result = matchGuess(secret, guess);
        for (const letter of new Set(guess)) {
          const credited = [...guess].filter((c, i) => c === letter && result[i] !== 'B').length;
          const inSecret = [...secret].filter(c => c === letter).length;
          expect(credited).toBeLessThanOrEqual(inSecret);
        }
      }),
    );
  })

  // Pattern: conditional. If given a secret word that has all unique letters and no duplicates, 
  // and the word is shifted by 1 letter, then result should be all Yellows.
  it('a rotation of a distinct-letter secret is all yellow', () => {
    const distinctWord = fc
      .shuffledSubarray([...ALPHABET], { minLength: 5, maxLength: 5 })
      .map((ls) => ls.join(''));
    fc.assert(
      fc.property(distinctWord, (secret) => {
        const guess = secret.slice(1) + secret[0];
        expect(colors(matchGuess(secret, guess))).toEqual(['Y', 'Y', 'Y', 'Y', 'Y']);
      }),
    );
  });

  // Pattern: metamorphic. Replacing a gray letter with a letter absent from the secret changes nothing.
  it('replacing a gray letter with an absent letter keeps the same colors', () => {
    fc.assert(
      fc.property(word, word, fc.nat(), (secret, guess, pick) => {
        const before = colors(matchGuess(secret, guess));
        const grays = before.flatMap((c, i) => (c === 'B' ? [i] : []));
        if (grays.length === 0) return; // nothing to replace

        const i = grays[pick % grays.length];
        const absent = [...ALPHABET].find((c) => !secret.includes(c))!;
        const changed = guess.slice(0, i) + absent + guess.slice(i + 1);

        expect(colors(matchGuess(secret, changed))).toEqual(before);
      }),
    );
  });
});
