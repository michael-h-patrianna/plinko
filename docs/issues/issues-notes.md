1. sometimes the plinko board does not shake when the user wins. is it possible that the shake is only for certain prize types? it feels like it is not shaking for free spin and random reward prizes.

2. when winning a random reward or anything that has exactly 1 of it, the revealreward view will automatically close shortly after open and reset the game, instead of giving the user the option to claim the prize.


1. Make sure physicsViolations.test.ts also tests for and fails when a ball gets stuck on its journey and never reaches a slot.
2. Then carefully investigate and fix the edge case issue that a ball can get stuck. This should and must be impossible.
3. Then carefully investigate and fix the edge case issue that the ball can in some situations reach an unrealistic high speed.

Since the issues to fix are edge cases that rarely happen, make sure the number of simulations is large enough. We will use this game millions of time per day. We cannot have even 1 such edge case failure.

