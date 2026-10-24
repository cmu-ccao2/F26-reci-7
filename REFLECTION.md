# Reflection

**Name / Andrew ID:** cynthia / ccao2

**Recitation group members (Task 2):** didn't have a group...

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

"metamorphic: reordering the input does not change the output"
it would catch a failing implementation where the implementation reads/expects 
the intervals to be passed in with some kind of ordering. like it would fail on
[1, 2] [10, 12] [2, 3] because it forgets about [1, 2] by the time [2, 3] 
is read.  

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

given fc.tuple(fc.integer(), fc.integer()) 
fc.integer() generates a random integer, the chances that it ever generates 2 of
the same integers, even in 100 runs, is very low. therefore testing for 
neighboring intervals is difficult and unlikely to actually be tested, resulting
in flaky tests. 

fix is to purposefully generate smaller intervals that do overlap (also i had to
remove the last property test because that one was also killing the mutants via 
a different generator approach too).

**BEFORE:** 
``` 
npm run mutants:intervals

> pbt-fast-check@1.0.0 mutants:intervals
> tsx scripts/mutants.ts intervals


Checking test/intervals.test.ts against the correct implementation (5 runs)...
  ✔ all 6 test(s) pass

Running against 7 mutants (5 runs each)...

  ✔ assumesSorted           killed  by: every input interval lies inside some output interval; is independent of input order; matches the reference implementation
      Counterexample: [[[0,0],[-1,0]]]
      AssertionError: expected [ [ -1, +0 ] ] to deeply equal []
  ✔ lexicographicSort       killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; matches the reference implementation
      Counterexample: [[[-100000000,0],[-100000001,0]]]
      AssertionError: expected [ [ -100000001, +0 ] ] to deeply equal []
  ✔ touchingNotMerged       killed  by: consecutive output intervals are strictly separated; is independent of input order
      Counterexample: [[[0,19],[19,19]]]
      AssertionError: expected 19 to be less than 19
  ~ mergesIntegerNeighbors  flaky: killed in 1/5 runs  by: matches the reference implementation
      Counterexample: [[[8,8],[0,7]]]
      AssertionError: expected [ [ +0, 8 ] ] to deeply equal [ [ +0, 7 ], [ 8, 8 ] ]
  ✔ keepsLastEnd            killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; is independent of input order; matches the reference implementation
      Counterexample: [[[0,0],[-1,1]]]
      AssertionError: expected [ [ -1, 1 ] ] to deeply equal []
  ✔ dropsLast               killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; matches the reference implementation
      Counterexample: [[[0,0]]]
      AssertionError: expected [ [ +0, +0 ] ] to deeply equal []
  ✔ aliasesInput            killed  by: does not mutate or alias its input
      Counterexample: [[[0,0]]]
      AssertionError: expected true to be false // Object.is equality

Mutation score: 6/7 killed (86%) 
```

**AFTER:**

``` 
npm run mutants:intervals

> pbt-fast-check@1.0.0 mutants:intervals
> tsx scripts/mutants.ts intervals


Checking test/intervals.test.ts against the correct implementation (5 runs)...
  ✔ all 7 test(s) pass

Running against 7 mutants (5 runs each)...

  ✔ assumesSorted           killed  by: every input interval lies inside some output interval; is independent of input order; matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[0,0],[-1,0]]]
      AssertionError: expected [ [ -1, +0 ] ] to deeply equal []
  ✔ lexicographicSort       killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[1000000000,1000000000],[2,2]]]
      AssertionError: expected [ [ 2, 2 ] ] to deeply equal []
  ✔ touchingNotMerged       killed  by: consecutive output intervals are strictly separated; matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[-17,-17],[-17,0]]]
      AssertionError: expected -17 to be less than -17
  ✔ mergesIntegerNeighbors  killed  by: matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[-10,0],[-11,-11]]]
      AssertionError: expected [ [ -11, +0 ] ] to deeply equal [ [ -11, -11 ], [ -10, +0 ] ]
  ✔ keepsLastEnd            killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; is independent of input order; matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[-1,0],[-1,-1]]]
      AssertionError: expected [ [ -1, +0 ] ] to deeply equal []
  ✔ dropsLast               killed  by: every input interval lies inside some output interval; merging the parts then the whole equals merging the whole; matches the reference implementation; merges two intervals exactly when they overlap or touch
      Counterexample: [[[0,0]]]
      AssertionError: expected [ [ +0, +0 ] ] to deeply equal []
  ✔ aliasesInput            killed  by: does not mutate or alias its input
      Counterexample: [[[0,0]]]
      AssertionError: expected true to be false // Object.is equality

Mutation score: 7/7 killed (100%) 
```


### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

something like [1,2] [3,4] kills mergesIntegerNeighbors because the 
specification states that the
interval includes all real numbers, and there are real numbers between 2 and 3.
but if the specification said that it only includes integers, then there are no
integers between 2 and 3, and this would get merged into an interval of [1, 4].

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

I forgot the name of the function even thought I implmented it, but the function
that traverses through the session_labels table to return the correct 
suggestions when you search. I feel like it would probably benefit from more
testing of any kind honestly, considering it's a pretty impactful function
for our feature... 

Test a metamorphic property where a longer query narrows the results?
eg. adding characters to the end of a search never adds new suggestions. "151"
will return the same number or less results than "15"

An invariant could be that the suggested labels should actually be in the table?
Like there's a finite number of labels, and the suggested label should be 
something in the table? This wouldnt catch a lot of bugs I don't think, maybe
if a different table was accidently being read,,,
