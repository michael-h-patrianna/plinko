/**
 * Comprehensive prize validation module
 * Provides type-specific validators for all prize types with descriptive error messages
 */

import type {
  CollectibleConfig,
  FreeReward,
  Prize,
  PrizeType,
  PurchaseOffer,
  RandomRewardConfig,
} from './prizeTypes';

/**
 * Validation error with descriptive message and context
 */
export class PrizeValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly prizeId?: string
  ) {
    super(message);
    this.name = 'PrizeValidationError';
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: PrizeValidationError[];
}

/**
 * Create a successful validation result
 */
function validResult(): ValidationResult {
  return { valid: true, errors: [] };
}

/**
 * Create a failed validation result
 */
function invalidResult(errors: PrizeValidationError[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Validate a string field is non-empty
 */
function validateNonEmptyString(
  value: unknown,
  fieldName: string,
  prizeId?: string
): PrizeValidationError | null {
  if (typeof value !== 'string') {
    return new PrizeValidationError(
      `${fieldName} must be a string, got ${typeof value}`,
      fieldName,
      prizeId
    );
  }
  if (value.trim().length === 0) {
    return new PrizeValidationError(`${fieldName} cannot be empty`, fieldName, prizeId);
  }
  return null;
}

/**
 * Validate a number field is non-negative
 */
function validateNonNegativeNumber(
  value: unknown,
  fieldName: string,
  prizeId?: string
): PrizeValidationError | null {
  if (typeof value !== 'number') {
    return new PrizeValidationError(
      `${fieldName} must be a number, got ${typeof value}`,
      fieldName,
      prizeId
    );
  }
  if (!Number.isFinite(value)) {
    return new PrizeValidationError(`${fieldName} must be a finite number`, fieldName, prizeId);
  }
  if (value < 0) {
    return new PrizeValidationError(
      `${fieldName} must be non-negative, got ${value}`,
      fieldName,
      prizeId
    );
  }
  return null;
}

/**
 * Validate a number field is positive
 */
function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  prizeId?: string
): PrizeValidationError | null {
  if (typeof value !== 'number') {
    return new PrizeValidationError(
      `${fieldName} must be a number, got ${typeof value}`,
      fieldName,
      prizeId
    );
  }
  if (!Number.isFinite(value)) {
    return new PrizeValidationError(`${fieldName} must be a finite number`, fieldName, prizeId);
  }
  if (value <= 0) {
    return new PrizeValidationError(
      `${fieldName} must be positive, got ${value}`,
      fieldName,
      prizeId
    );
  }
  return null;
}

/**
 * Validate probability is in valid range [0, 1]
 */
function validateProbability(
  value: unknown,
  fieldName: string,
  prizeId?: string
): PrizeValidationError | null {
  const numberError = validateNonNegativeNumber(value, fieldName, prizeId);
  if (numberError) return numberError;

  if ((value as number) > 1) {
    return new PrizeValidationError(
      `${fieldName} must be between 0 and 1, got ${value}`,
      fieldName,
      prizeId
    );
  }
  return null;
}

/**
 * Validate CollectibleConfig structure
 */
function validateCollectibleConfig(
  config: unknown,
  prizeId?: string
): PrizeValidationError[] {
  const errors: PrizeValidationError[] = [];

  if (!config || typeof config !== 'object') {
    errors.push(
      new PrizeValidationError(
        'CollectibleConfig must be an object',
        'xp.config',
        prizeId
      )
    );
    return errors;
  }

  const cfg = config as Partial<CollectibleConfig>;

  const iconError = validateNonEmptyString(cfg.icon, 'xp.config.icon', prizeId);
  if (iconError) errors.push(iconError);

  const nameError = validateNonEmptyString(cfg.name, 'xp.config.name', prizeId);
  if (nameError) errors.push(nameError);

  return errors;
}

/**
 * Validate RandomRewardConfig structure
 */
function validateRandomRewardConfig(
  config: unknown,
  prizeId?: string
): PrizeValidationError[] {
  const errors: PrizeValidationError[] = [];

  if (!config || typeof config !== 'object') {
    errors.push(
      new PrizeValidationError(
        'RandomRewardConfig must be an object',
        'randomReward.config',
        prizeId
      )
    );
    return errors;
  }

  const cfg = config as Partial<RandomRewardConfig>;

  const iconError = validateNonEmptyString(cfg.icon, 'randomReward.config.icon', prizeId);
  if (iconError) errors.push(iconError);

  const nameError = validateNonEmptyString(cfg.name, 'randomReward.config.name', prizeId);
  if (nameError) errors.push(nameError);

  return errors;
}

/**
 * Validate FreeReward structure
 */
export function validateFreeReward(reward: unknown, prizeId?: string): ValidationResult {
  const errors: PrizeValidationError[] = [];

  if (!reward || typeof reward !== 'object') {
    errors.push(
      new PrizeValidationError(
        'FreeReward must be an object',
        'freeReward',
        prizeId
      )
    );
    return invalidResult(errors);
  }

  const freeReward = reward as Partial<FreeReward>;

  // Validate GC if present
  if (freeReward.gc !== undefined) {
    const gcError = validatePositiveNumber(freeReward.gc, 'freeReward.gc', prizeId);
    if (gcError) errors.push(gcError);
  }

  // Validate SC if present
  if (freeReward.sc !== undefined) {
    const scError = validatePositiveNumber(freeReward.sc, 'freeReward.sc', prizeId);
    if (scError) errors.push(scError);
  }

  // Validate Spins if present
  if (freeReward.spins !== undefined) {
    const spinsError = validatePositiveNumber(freeReward.spins, 'freeReward.spins', prizeId);
    if (spinsError) errors.push(spinsError);
  }

  // Validate XP if present
  if (freeReward.xp !== undefined) {
    if (!freeReward.xp || typeof freeReward.xp !== 'object') {
      errors.push(
        new PrizeValidationError(
          'freeReward.xp must be an object',
          'freeReward.xp',
          prizeId
        )
      );
    } else {
      const amountError = validatePositiveNumber(
        freeReward.xp.amount,
        'freeReward.xp.amount',
        prizeId
      );
      if (amountError) errors.push(amountError);

      const configErrors = validateCollectibleConfig(freeReward.xp.config, prizeId);
      errors.push(...configErrors);
    }
  }

  // Validate RandomReward if present
  if (freeReward.randomReward !== undefined) {
    if (!freeReward.randomReward || typeof freeReward.randomReward !== 'object') {
      errors.push(
        new PrizeValidationError(
          'freeReward.randomReward must be an object',
          'freeReward.randomReward',
          prizeId
        )
      );
    } else {
      const configErrors = validateRandomRewardConfig(
        freeReward.randomReward.config,
        prizeId
      );
      errors.push(...configErrors);
    }
  }

  // At least one reward type must be present
  const hasAnyReward =
    freeReward.gc !== undefined ||
    freeReward.sc !== undefined ||
    freeReward.spins !== undefined ||
    freeReward.xp !== undefined ||
    freeReward.randomReward !== undefined;

  if (!hasAnyReward) {
    errors.push(
      new PrizeValidationError(
        'FreeReward must contain at least one reward (gc, sc, spins, xp, or randomReward)',
        'freeReward',
        prizeId
      )
    );
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate PurchaseOffer structure
 */
export function validatePurchaseOffer(offer: unknown, prizeId?: string): ValidationResult {
  const errors: PrizeValidationError[] = [];

  if (!offer || typeof offer !== 'object') {
    errors.push(
      new PrizeValidationError(
        'PurchaseOffer must be an object',
        'purchaseOffer',
        prizeId
      )
    );
    return invalidResult(errors);
  }

  const purchaseOffer = offer as Partial<PurchaseOffer>;

  // Validate offerId (required, non-empty)
  const offerIdError = validateNonEmptyString(
    purchaseOffer.offerId,
    'purchaseOffer.offerId',
    prizeId
  );
  if (offerIdError) errors.push(offerIdError);

  // Validate title (required, non-empty)
  const titleError = validateNonEmptyString(
    purchaseOffer.title,
    'purchaseOffer.title',
    prizeId
  );
  if (titleError) errors.push(titleError);

  // Validate description (optional, but if present must be string)
  if (purchaseOffer.description !== undefined) {
    if (typeof purchaseOffer.description !== 'string') {
      errors.push(
        new PrizeValidationError(
          `purchaseOffer.description must be a string, got ${typeof purchaseOffer.description}`,
          'purchaseOffer.description',
          prizeId
        )
      );
    }
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate base Prize fields (common to all types)
 */
function validateBasePrizeFields(prize: Partial<Prize>): PrizeValidationError[] {
  const errors: PrizeValidationError[] = [];

  // Validate ID
  const idError = validateNonEmptyString(prize.id, 'id', prize.id);
  if (idError) errors.push(idError);

  // Validate type
  if (!prize.type) {
    errors.push(new PrizeValidationError('type is required', 'type', prize.id));
  } else if (!['no_win', 'free', 'purchase'].includes(prize.type)) {
    errors.push(
      new PrizeValidationError(
        `type must be one of: no_win, free, purchase; got ${prize.type}`,
        'type',
        prize.id
      )
    );
  }

  // Validate probability
  const probError = validateProbability(prize.probability, 'probability', prize.id);
  if (probError) errors.push(probError);

  // Validate slotIcon
  const iconError = validateNonEmptyString(prize.slotIcon, 'slotIcon', prize.id);
  if (iconError) errors.push(iconError);

  // Validate slotColor
  const colorError = validateNonEmptyString(prize.slotColor, 'slotColor', prize.id);
  if (colorError) errors.push(colorError);

  // Validate title
  const titleError = validateNonEmptyString(prize.title, 'title', prize.id);
  if (titleError) errors.push(titleError);

  // Validate description (optional)
  if (prize.description !== undefined && typeof prize.description !== 'string') {
    errors.push(
      new PrizeValidationError(
        `description must be a string, got ${typeof prize.description}`,
        'description',
        prize.id
      )
    );
  }

  return errors;
}

/**
 * Validate a no_win prize
 */
export function validateNoWinPrize(prize: Partial<Prize>): ValidationResult {
  const errors = validateBasePrizeFields(prize);

  // No-win prizes should not have freeReward or purchaseOffer
  if (prize.freeReward !== undefined) {
    errors.push(
      new PrizeValidationError(
        'no_win prize should not have freeReward',
        'freeReward',
        prize.id
      )
    );
  }

  if (prize.purchaseOffer !== undefined) {
    errors.push(
      new PrizeValidationError(
        'no_win prize should not have purchaseOffer',
        'purchaseOffer',
        prize.id
      )
    );
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate a free prize
 */
export function validateFreePrize(prize: Partial<Prize>): ValidationResult {
  const errors = validateBasePrizeFields(prize);

  // Free prizes must have freeReward
  if (!prize.freeReward) {
    errors.push(
      new PrizeValidationError(
        'free prize must have freeReward',
        'freeReward',
        prize.id
      )
    );
    return invalidResult(errors);
  }

  // Validate the freeReward structure
  const rewardResult = validateFreeReward(prize.freeReward, prize.id);
  errors.push(...rewardResult.errors);

  // Free prizes should not have purchaseOffer (though production data shows they can coexist)
  // This is intentionally lenient to match existing behavior

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate a purchase prize
 */
export function validatePurchasePrize(prize: Partial<Prize>): ValidationResult {
  const errors = validateBasePrizeFields(prize);

  // Purchase prizes must have purchaseOffer
  if (!prize.purchaseOffer) {
    errors.push(
      new PrizeValidationError(
        'purchase prize must have purchaseOffer',
        'purchaseOffer',
        prize.id
      )
    );
    return invalidResult(errors);
  }

  // Validate the purchaseOffer structure
  const offerResult = validatePurchaseOffer(prize.purchaseOffer, prize.id);
  errors.push(...offerResult.errors);

  // Purchase prizes can also have freeReward (for bundle deals)
  // This is intentionally lenient to match existing behavior
  if (prize.freeReward) {
    const rewardResult = validateFreeReward(prize.freeReward, prize.id);
    errors.push(...rewardResult.errors);
  }

  return errors.length > 0 ? invalidResult(errors) : validResult();
}

/**
 * Validate a single prize based on its type
 */
export function validatePrize(prize: unknown): ValidationResult {
  if (!prize || typeof prize !== 'object') {
    return invalidResult([
      new PrizeValidationError('Prize must be an object', undefined, undefined),
    ]);
  }

  const p = prize as Partial<Prize>;

  // Validate based on type
  switch (p.type) {
    case 'no_win':
      return validateNoWinPrize(p);
    case 'free':
      return validateFreePrize(p);
    case 'purchase':
      return validatePurchasePrize(p);
    default:
      return invalidResult([
        new PrizeValidationError(
          `Unknown prize type: ${p.type}`,
          'type',
          p.id
        ),
      ]);
  }
}

/**
 * Validate an array of prizes
 * This performs individual prize validation and does NOT check probability sums
 * (that's handled by validatePrizeSet in prizeUtils.ts)
 */
export function validatePrizes(prizes: unknown[]): ValidationResult {
  const allErrors: PrizeValidationError[] = [];

  for (let i = 0; i < prizes.length; i++) {
    const result = validatePrize(prizes[i]);
    if (!result.valid) {
      // Add index context to errors
      const indexedErrors = result.errors.map(
        (err) =>
          new PrizeValidationError(
            `Prize[${i}]: ${err.message}`,
            err.field,
            err.prizeId
          )
      );
      allErrors.push(...indexedErrors);
    }
  }

  return allErrors.length > 0 ? invalidResult(allErrors) : validResult();
}

/**
 * Validate a prize and throw on error (convenience function)
 */
export function validatePrizeOrThrow(prize: unknown): asserts prize is Prize {
  const result = validatePrize(prize);
  if (!result.valid) {
    const errorMessages = result.errors.map((e) => e.message).join('; ');
    throw new PrizeValidationError(`Prize validation failed: ${errorMessages}`);
  }
}

/**
 * Validate prizes and throw on error (convenience function)
 */
export function validatePrizesOrThrow(prizes: unknown[]): asserts prizes is Prize[] {
  const result = validatePrizes(prizes);
  if (!result.valid) {
    const errorMessages = result.errors.map((e) => e.message).join('; ');
    throw new PrizeValidationError(`Prize validation failed: ${errorMessages}`);
  }
}

/**
 * Type guard to check if a value is a valid Prize
 */
export function isPrize(value: unknown): value is Prize {
  const result = validatePrize(value);
  return result.valid;
}

/**
 * Type guard to check if a value is a valid PrizeType
 */
export function isPrizeType(value: unknown): value is PrizeType {
  return value === 'no_win' || value === 'free' || value === 'purchase';
}
