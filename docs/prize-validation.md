# Prize Validation System

## Overview

The prize validation system provides comprehensive, type-specific validation for all prize configurations in the Plinko game. It ensures that prize data is valid before being used in gameplay, providing descriptive error messages when validation fails.

## Architecture

The validation system consists of:

1. **Core Validation Module** (`src/game/prizeValidation.ts`) - Type-specific validators
2. **Zod Schema Integration** (`src/game/prizeProvider.ts`) - Schema-based validation
3. **Prize Provider Integration** - Automatic validation at load time
4. **Comprehensive Test Coverage** - Unit and integration tests

## Prize Types

The system validates three main prize types:

### 1. No-Win Prizes (`no_win`)

Prizes that provide no reward to the player.

**Required Fields:**
- `id`: string (non-empty)
- `type`: `'no_win'`
- `probability`: number (0 to 1)
- `slotIcon`: string (non-empty)
- `slotColor`: string (non-empty)
- `title`: string (non-empty)

**Optional Fields:**
- `description`: string

**Constraints:**
- Must NOT have `freeReward`
- Must NOT have `purchaseOffer`

**Example:**
```typescript
{
  id: 'no_win_1',
  type: 'no_win',
  probability: 0.1,
  slotIcon: '/assets/nowin.png',
  slotColor: '#64748B',
  title: 'No Win',
  description: 'Better luck next time!'
}
```

### 2. Free Prizes (`free`)

Prizes that grant free rewards (coins, spins, collectibles, etc.).

**Required Fields:**
- `id`: string (non-empty)
- `type`: `'free'`
- `probability`: number (0 to 1)
- `slotIcon`: string (non-empty)
- `slotColor`: string (non-empty)
- `title`: string (non-empty)
- `freeReward`: object (must contain at least one reward)

**Optional Fields:**
- `description`: string

**Free Reward Structure:**

The `freeReward` object can contain one or more of the following:

#### Gold Coins (GC)
```typescript
freeReward: {
  gc: number // Must be positive (> 0)
}
```

#### Sweeps Coins (SC)
```typescript
freeReward: {
  sc: number // Must be positive (> 0)
}
```

#### Free Spins
```typescript
freeReward: {
  spins: number // Must be positive (> 0)
}
```

#### Collectibles (XP)
```typescript
freeReward: {
  xp: {
    amount: number, // Must be positive (> 0)
    config: {
      icon: string, // Non-empty
      name: string  // Non-empty (e.g., "Stars", "Bats", "Pumpkins")
    }
  }
}
```

#### Random Rewards
```typescript
freeReward: {
  randomReward: {
    config: {
      icon: string, // Non-empty
      name: string  // Non-empty (e.g., "Bronze Wheel", "Silver Wheel")
    }
  }
}
```

#### Combo Rewards
Multiple reward types can be combined:
```typescript
freeReward: {
  gc: 1000,
  sc: 50,
  spins: 10,
  xp: {
    amount: 500,
    config: {
      icon: '/assets/xp.png',
      name: 'Stars'
    }
  },
  randomReward: {
    config: {
      icon: '/assets/random_reward.png',
      name: 'Bronze Wheel'
    }
  }
}
```

**Constraints:**
- `freeReward` must contain **at least one** reward type (gc, sc, spins, xp, or randomReward)
- All numeric values must be **positive** (> 0), not just non-negative
- All config objects must have non-empty `icon` and `name` fields

**Examples:**

Simple GC reward:
```typescript
{
  id: 'gc_100',
  type: 'free',
  probability: 0.2,
  slotIcon: '/assets/gc.png',
  slotColor: '#34D399',
  title: '100 GC',
  freeReward: {
    gc: 100
  }
}
```

XP reward:
```typescript
{
  id: 'stars_500',
  type: 'free',
  probability: 0.1,
  slotIcon: '/assets/xp.png',
  slotColor: '#818CF8',
  title: '500 Stars',
  freeReward: {
    xp: {
      amount: 500,
      config: {
        icon: '/assets/xp.png',
        name: 'Stars'
      }
    }
  }
}
```

### 3. Purchase Prizes (`purchase`)

Prizes that present purchase offers to the player.

**Required Fields:**
- `id`: string (non-empty)
- `type`: `'purchase'`
- `probability`: number (0 to 1)
- `slotIcon`: string (non-empty)
- `slotColor`: string (non-empty)
- `title`: string (non-empty)
- `purchaseOffer`: object

**Optional Fields:**
- `description`: string
- `freeReward`: object (for bundle deals)

**Purchase Offer Structure:**
```typescript
purchaseOffer: {
  offerId: string,     // Non-empty, unique identifier
  title: string,       // Non-empty, display title
  description?: string // Optional, offer description
}
```

**Examples:**

Simple purchase offer:
```typescript
{
  id: 'offer_1',
  type: 'purchase',
  probability: 0.05,
  slotIcon: '/assets/offer.png',
  slotColor: '#EF4444',
  title: 'Special Offer',
  purchaseOffer: {
    offerId: 'offer_001',
    title: '50% Off Premium Pack',
    description: 'Limited time only!'
  }
}
```

Purchase bundle with free rewards:
```typescript
{
  id: 'bundle_1',
  type: 'purchase',
  probability: 0.05,
  slotIcon: '/assets/offer.png',
  slotColor: '#EF4444',
  title: 'Premium Bundle',
  purchaseOffer: {
    offerId: 'bundle_001',
    title: 'Premium Bundle',
    description: 'Get GC + SC!'
  },
  freeReward: {
    gc: 10000,
    sc: 100
  }
}
```

## Validation Rules

### Common Validation (All Prize Types)

1. **ID Validation**
   - Must be a non-empty string
   - Should be unique within a prize set

2. **Type Validation**
   - Must be one of: `'no_win'`, `'free'`, `'purchase'`

3. **Probability Validation**
   - Must be a finite number
   - Must be between 0 and 1 (inclusive)
   - All probabilities in a prize set must sum to 1.0 (within tolerance of 1e-6)

4. **Display Fields**
   - `slotIcon`: Must be non-empty string
   - `slotColor`: Must be non-empty string
   - `title`: Must be non-empty string
   - `description`: If present, must be a string

5. **Prize Set Validation**
   - Must contain 3-8 prizes
   - All prize IDs should be unique
   - Probabilities must sum to 1.0

### Type-Specific Validation

#### No-Win Prize Rules
- ❌ Must NOT have `freeReward`
- ❌ Must NOT have `purchaseOffer`

#### Free Prize Rules
- ✅ Must have `freeReward` object
- ✅ `freeReward` must contain at least one reward type
- ✅ All numeric rewards must be positive (> 0)
- ✅ XP config must have non-empty `icon` and `name`
- ✅ Random reward config must have non-empty `icon` and `name`
- ℹ️ Can optionally have `purchaseOffer` (for special cases)

#### Purchase Prize Rules
- ✅ Must have `purchaseOffer` object
- ✅ `offerId` must be non-empty string
- ✅ `title` must be non-empty string
- ℹ️ Can optionally have `freeReward` (for bundle deals)

## Usage

### Validating a Single Prize

```typescript
import { validatePrize, validatePrizeOrThrow } from '../game/prizeValidation';

// Option 1: Get validation result
const result = validatePrize(prize);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
  result.errors.forEach(err => {
    console.error(`- ${err.field}: ${err.message}`);
  });
}

// Option 2: Throw on error
try {
  validatePrizeOrThrow(prize);
  console.log('Prize is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Validating Multiple Prizes

```typescript
import { validatePrizes, validatePrizesOrThrow } from '../game/prizeValidation';

// Option 1: Get validation result
const result = validatePrizes(prizes);
if (!result.valid) {
  console.error('Found validation errors:');
  result.errors.forEach(err => {
    console.error(`- Prize[${err.prizeId}].${err.field}: ${err.message}`);
  });
}

// Option 2: Throw on error
try {
  validatePrizesOrThrow(prizes);
  console.log('All prizes are valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Type Guards

```typescript
import { isPrize, isPrizeType } from '../game/prizeValidation';

// Check if value is a valid prize
if (isPrize(value)) {
  // TypeScript knows value is a Prize
  console.log(value.id);
}

// Check if value is a valid prize type
if (isPrizeType(value)) {
  // TypeScript knows value is PrizeType
  const type: PrizeType = value;
}
```

### Automatic Validation in Prize Provider

The prize provider automatically validates all prizes when loading:

```typescript
import { validatePrizeProviderPayload } from '../game/prizeProvider';

try {
  const result = validatePrizeProviderPayload({
    prizes: myPrizes,
    winningIndex: 0,
    seed: 12345,
    source: 'default'
  });
  console.log('Loaded valid prize set:', result.prizes);
} catch (error) {
  // ZodError with detailed validation messages
  console.error('Invalid prize configuration:', error);
}
```

## Error Messages

The validation system provides descriptive error messages:

### Common Errors

- `"id cannot be empty"` - Prize ID is missing or empty
- `"type must be one of: no_win, free, purchase; got invalid_type"` - Invalid prize type
- `"probability must be between 0 and 1, got 1.5"` - Probability out of range
- `"probability must be a finite number"` - Probability is NaN or Infinity
- `"slotIcon cannot be empty"` - Missing slot icon

### Free Prize Errors

- `"free prize must have freeReward"` - Missing freeReward object
- `"FreeReward must contain at least one reward (gc, sc, spins, xp, or randomReward)"` - Empty freeReward
- `"freeReward.gc must be positive, got 0"` - Zero or negative GC amount
- `"freeReward.xp.amount must be positive, got -10"` - Negative XP amount
- `"xp.config.icon cannot be empty"` - Missing XP icon
- `"randomReward.config.name cannot be empty"` - Missing random reward name

### Purchase Prize Errors

- `"purchase prize must have purchaseOffer"` - Missing purchaseOffer object
- `"purchaseOffer.offerId cannot be empty"` - Missing or empty offerId
- `"purchaseOffer.title must be a string, got number"` - Wrong type for title

### No-Win Prize Errors

- `"no_win prize should not have freeReward"` - Invalid freeReward on no-win
- `"no_win prize should not have purchaseOffer"` - Invalid purchaseOffer on no-win

## Testing

The validation system has comprehensive test coverage:

### Unit Tests (`src/tests/prizeValidation.test.ts`)

- 50 unit tests covering all validation rules
- Tests for valid and invalid configurations
- Edge case and boundary condition testing
- Type guard testing

### Integration Tests (`src/tests/prizeValidationIntegration.test.ts`)

- 20 integration tests with prize provider
- Tests invalid configs are rejected at provider level
- Tests valid configs are accepted
- Tests error message quality

### Running Tests

```bash
# Run all prize validation tests
npm test -- prizeValidation

# Run unit tests only
npx vitest run src/tests/prizeValidation.test.ts

# Run integration tests only
npx vitest run src/tests/prizeValidationIntegration.test.ts
```

## Extending Validators

To add validation for a new prize type:

1. **Update PrizeType** in `src/game/prizeTypes.ts`:
```typescript
export type PrizeType = 'no_win' | 'free' | 'purchase' | 'new_type';
```

2. **Add type-specific interface** in `src/game/prizeTypes.ts`:
```typescript
export interface NewTypeData {
  field1: string;
  field2: number;
}
```

3. **Update Prize interface**:
```typescript
export interface Prize {
  // ... existing fields
  newTypeData?: NewTypeData;
}
```

4. **Create validator** in `src/game/prizeValidation.ts`:
```typescript
function validateNewTypeData(data: unknown, prizeId?: string): ValidationResult {
  const errors: PrizeValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push(new PrizeValidationError(
      'NewTypeData must be an object',
      'newTypeData',
      prizeId
    ));
    return invalidResult(errors);
  }

  const typedData = data as Partial<NewTypeData>;

  // Add field validation here
  const field1Error = validateNonEmptyString(typedData.field1, 'newTypeData.field1', prizeId);
  if (field1Error) errors.push(field1Error);

  const field2Error = validatePositiveNumber(typedData.field2, 'newTypeData.field2', prizeId);
  if (field2Error) errors.push(field2Error);

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

function validateNewTypePrize(prize: Partial<Prize>): ValidationResult {
  const errors = validateBasePrizeFields(prize);

  if (!prize.newTypeData) {
    errors.push(new PrizeValidationError(
      'new_type prize must have newTypeData',
      'newTypeData',
      prize.id
    ));
    return invalidResult(errors);
  }

  const dataResult = validateNewTypeData(prize.newTypeData, prize.id);
  errors.push(...dataResult.errors);

  return errors.length > 0 ? invalidResult(errors) : validResult();
}
```

5. **Update main validator**:
```typescript
export function validatePrize(prize: unknown): ValidationResult {
  // ... existing code

  switch (p.type) {
    case 'no_win':
      return validateNoWinPrize(p);
    case 'free':
      return validateFreePrize(p);
    case 'purchase':
      return validatePurchasePrize(p);
    case 'new_type':
      return validateNewTypePrize(p);
    default:
      return invalidResult([
        new PrizeValidationError(`Unknown prize type: ${p.type}`, 'type', p.id),
      ]);
  }
}
```

6. **Add Zod schema** in `src/game/prizeProvider.ts`:
```typescript
const newTypeDataSchema = z
  .object({
    field1: z.string().min(1),
    field2: z.number().positive(),
  })
  .strict();

export const prizeConfigSchema = z
  .object({
    // ... existing fields
    newTypeData: newTypeDataSchema.optional(),
  })
  .passthrough();
```

7. **Write tests** in `src/tests/prizeValidation.test.ts`:
```typescript
describe('validatePrize - new_type type', () => {
  it('validates a valid new_type prize', () => {
    const prize: Prize = {
      id: 'new_1',
      type: 'new_type',
      probability: 0.1,
      slotIcon: '/icon.png',
      slotColor: '#000000',
      title: 'New Type Prize',
      newTypeData: {
        field1: 'value',
        field2: 100,
      },
    };

    const result = validatePrize(prize);
    expect(result.valid).toBe(true);
  });

  it('rejects new_type prize without newTypeData', () => {
    // ... test implementation
  });

  // Add more tests
});
```

## Best Practices

1. **Always validate before use**: Never assume prize data is valid
2. **Use type guards**: Leverage `isPrize()` for runtime type checking
3. **Provide context**: Include `prizeId` in validation errors for debugging
4. **Test edge cases**: Write tests for boundary conditions and malformed data
5. **Validate early**: Catch validation errors at the provider level, not during gameplay
6. **Use descriptive errors**: Error messages should clearly explain what's wrong
7. **Maintain backward compatibility**: When adding new validation rules, consider existing data

## Related Files

- `/src/game/prizeValidation.ts` - Core validation module
- `/src/game/prizeProvider.ts` - Prize provider with Zod integration
- `/src/game/prizeTypes.ts` - Prize type definitions
- `/src/utils/prizeUtils.ts` - Probability validation utilities
- `/src/tests/prizeValidation.test.ts` - Unit tests
- `/src/tests/prizeValidationIntegration.test.ts` - Integration tests
