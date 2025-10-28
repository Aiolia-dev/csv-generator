# Step 03: Data Generators Implementation

## Overview

Implement the data generation functions using @faker-js/faker. These generators will create realistic data for each supported data type.

## What You'll Build

- Faker.js integration
- Data generator functions for all 9 data types
- Generator map for easy access
- Fallback generators (if Faker fails)
- Generator testing utilities

## Prerequisites

- Step 01 completed (project setup)
- Step 02 completed (type definitions)
- @faker-js/faker installed

## Implementation Steps

### 1. Create Data Generators

Create `src/lib/dataGenerators.ts`:

```typescript
import { faker } from '@faker-js/faker';
import { DataType, DataGenerator, DataGeneratorMap } from '@/types';

/**
 * Generate random integer
 */
function generateInteger(): number {
  return faker.number.int({ min: 1, max: 10000 });
}

/**
 * Generate random float
 */
function generateFloat(): number {
  return faker.number.float({
    min: 0,
    max: 10000,
    fractionDigits: 2,
  });
}

/**
 * Generate random boolean
 */
function generateBoolean(): boolean {
  return faker.datatype.boolean();
}

/**
 * Generate random string (lorem ipsum sentence)
 */
function generateString(): string {
  return faker.lorem.sentence({ min: 3, max: 10 });
}

/**
 * Generate random date (YYYY-MM-DD format)
 */
function generateDate(): string {
  const date = faker.date.between({
    from: '2020-01-01',
    to: '2025-12-31',
  });
  return date.toISOString().split('T')[0];
}

/**
 * Generate random datetime (ISO 8601 format)
 */
function generateDateTime(): string {
  const date = faker.date.between({
    from: '2020-01-01',
    to: '2025-12-31',
  });
  return date.toISOString();
}

/**
 * Generate random email address
 */
function generateEmail(): string {
  return faker.internet.email();
}

/**
 * Generate random phone number
 */
function generatePhone(): string {
  return faker.phone.number();
}

/**
 * Generate random UUID (v4)
 */
function generateUUID(): string {
  return faker.string.uuid();
}

/**
 * Map of data types to generator functions
 */
export const dataGenerators: DataGeneratorMap = {
  [DataType.Integer]: generateInteger,
  [DataType.Float]: generateFloat,
  [DataType.Boolean]: generateBoolean,
  [DataType.String]: generateString,
  [DataType.Date]: generateDate,
  [DataType.DateTime]: generateDateTime,
  [DataType.Email]: generateEmail,
  [DataType.Phone]: generatePhone,
  [DataType.UUID]: generateUUID,
};

/**
 * Generate data for a specific data type
 * @param dataType - The data type to generate
 * @returns Generated value as string, number, or boolean
 */
export function generateDataForType(
  dataType: DataType
): string | number | boolean {
  const generator = dataGenerators[dataType];

  if (!generator) {
    throw new Error(`No generator found for data type: ${dataType}`);
  }

  try {
    return generator();
  } catch (error) {
    console.error(`Error generating data for type ${dataType}:`, error);
    return getFallbackValue(dataType);
  }
}

/**
 * Fallback values if Faker.js fails
 */
function getFallbackValue(dataType: DataType): string | number | boolean {
  switch (dataType) {
    case DataType.Integer:
      return Math.floor(Math.random() * 10000);
    case DataType.Float:
      return Math.round(Math.random() * 10000 * 100) / 100;
    case DataType.Boolean:
      return Math.random() > 0.5;
    case DataType.String:
      return 'Sample text';
    case DataType.Date:
      return new Date().toISOString().split('T')[0];
    case DataType.DateTime:
      return new Date().toISOString();
    case DataType.Email:
      return 'user@example.com';
    case DataType.Phone:
      return '+1-555-0100';
    case DataType.UUID:
      return '00000000-0000-0000-0000-000000000000';
    default:
      return '';
  }
}

/**
 * Generate a sample row of data
 * @param dataTypes - Array of data types for each column
 * @returns Array of generated values
 */
export function generateSampleRow(
  dataTypes: DataType[]
): (string | number | boolean)[] {
  return dataTypes.map((dataType) => generateDataForType(dataType));
}

/**
 * Generate multiple rows of data
 * @param dataTypes - Array of data types for each column
 * @param rowCount - Number of rows to generate
 * @returns 2D array of generated values
 */
export function generateMultipleRows(
  dataTypes: DataType[],
  rowCount: number
): (string | number | boolean)[][] {
  const rows: (string | number | boolean)[][] = [];

  for (let i = 0; i < rowCount; i++) {
    rows.push(generateSampleRow(dataTypes));
  }

  return rows;
}

/**
 * Set Faker.js seed for reproducible data
 * @param seed - Seed value
 */
export function setGeneratorSeed(seed: number): void {
  faker.seed(seed);
}

/**
 * Reset Faker.js seed to random
 */
export function resetGeneratorSeed(): void {
  faker.seed();
}

/**
 * Test if Faker.js is working correctly
 * @returns true if Faker.js is functional
 */
export function testGenerators(): boolean {
  try {
    // Test each generator
    for (const dataType of Object.values(DataType)) {
      const value = generateDataForType(dataType);
      if (value === null || value === undefined) {
        console.error(`Generator for ${dataType} returned null/undefined`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Generator test failed:', error);
    return false;
  }
}
```

### 2. Create Generator Utilities

Create `src/lib/generatorUtils.ts`:

```typescript
import { DataType, AVERAGE_DATA_LENGTHS } from '@/types';

/**
 * Get average data length for a data type
 * @param dataType - The data type
 * @returns Average length in characters
 */
export function getAverageDataLength(dataType: DataType): number {
  return AVERAGE_DATA_LENGTHS[dataType] || 20;
}

/**
 * Estimate total data length for a row
 * @param dataTypes - Array of data types in the row
 * @returns Estimated length in characters
 */
export function estimateRowLength(dataTypes: DataType[]): number {
  return dataTypes.reduce((total, dataType) => {
    return total + getAverageDataLength(dataType);
  }, 0);
}

/**
 * Format generated value to string
 * @param value - The value to format
 * @returns Formatted string
 */
export function formatGeneratedValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}

/**
 * Validate generated value
 * @param value - The value to validate
 * @param dataType - Expected data type
 * @returns true if valid
 */
export function validateGeneratedValue(
  value: string | number | boolean,
  dataType: DataType
): boolean {
  switch (dataType) {
    case DataType.Integer:
      return typeof value === 'number' && Number.isInteger(value);

    case DataType.Float:
      return typeof value === 'number' && !Number.isNaN(value);

    case DataType.Boolean:
      return typeof value === 'boolean';

    case DataType.String:
      return typeof value === 'string' && value.length > 0;

    case DataType.Date:
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

    case DataType.DateTime:
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value);

    case DataType.Email:
      return (
        typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      );

    case DataType.Phone:
      return typeof value === 'string' && value.length > 0;

    case DataType.UUID:
      return (
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value
        )
      );

    default:
      return false;
  }
}

/**
 * Get example value for a data type
 * @param dataType - The data type
 * @returns Example value as string
 */
export function getExampleValue(dataType: DataType): string {
  switch (dataType) {
    case DataType.Integer:
      return '42';
    case DataType.Float:
      return '3.14';
    case DataType.Boolean:
      return 'true';
    case DataType.String:
      return 'Lorem ipsum dolor sit amet';
    case DataType.Date:
      return '2024-10-28';
    case DataType.DateTime:
      return '2024-10-28T14:30:00.000Z';
    case DataType.Email:
      return 'john.doe@example.com';
    case DataType.Phone:
      return '+1-555-123-4567';
    case DataType.UUID:
      return '550e8400-e29b-41d4-a716-446655440000';
    default:
      return '';
  }
}
```

### 3. Create Generator Configuration

Create `src/lib/generatorConfig.ts`:

```typescript
import { DataType } from '@/types';

/**
 * Configuration for data generators
 */
export interface GeneratorConfig {
  /** Locale for Faker.js */
  locale: string;
  /** Seed for reproducible data (optional) */
  seed?: number;
  /** Custom ranges for numeric types */
  ranges?: {
    integer?: { min: number; max: number };
    float?: { min: number; max: number; fractionDigits: number };
  };
  /** Date range for date/datetime types */
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Default generator configuration
 */
export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  locale: 'en',
  ranges: {
    integer: { min: 1, max: 10000 },
    float: { min: 0, max: 10000, fractionDigits: 2 },
  },
  dateRange: {
    from: '2020-01-01',
    to: '2025-12-31',
  },
};

/**
 * Get configuration for a specific data type
 * @param dataType - The data type
 * @param config - Generator configuration
 * @returns Type-specific configuration
 */
export function getTypeConfig(
  dataType: DataType,
  config: GeneratorConfig = DEFAULT_GENERATOR_CONFIG
): any {
  switch (dataType) {
    case DataType.Integer:
      return config.ranges?.integer || DEFAULT_GENERATOR_CONFIG.ranges!.integer;

    case DataType.Float:
      return config.ranges?.float || DEFAULT_GENERATOR_CONFIG.ranges!.float;

    case DataType.Date:
    case DataType.DateTime:
      return config.dateRange || DEFAULT_GENERATOR_CONFIG.dateRange;

    default:
      return {};
  }
}
```

### 4. Create Test Utilities

Create `src/lib/__tests__/dataGenerators.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  generateDataForType,
  generateSampleRow,
  generateMultipleRows,
  testGenerators,
  setGeneratorSeed,
} from '../dataGenerators';
import { DataType } from '@/types';
import { validateGeneratedValue } from '../generatorUtils';

describe('Data Generators', () => {
  it('should generate valid integers', () => {
    const value = generateDataForType(DataType.Integer);
    expect(typeof value).toBe('number');
    expect(Number.isInteger(value)).toBe(true);
  });

  it('should generate valid floats', () => {
    const value = generateDataForType(DataType.Float);
    expect(typeof value).toBe('number');
    expect(!Number.isNaN(value)).toBe(true);
  });

  it('should generate valid booleans', () => {
    const value = generateDataForType(DataType.Boolean);
    expect(typeof value).toBe('boolean');
  });

  it('should generate valid strings', () => {
    const value = generateDataForType(DataType.String);
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });

  it('should generate valid dates', () => {
    const value = generateDataForType(DataType.Date);
    expect(typeof value).toBe('string');
    expect(/^\d{4}-\d{2}-\d{2}$/.test(value as string)).toBe(true);
  });

  it('should generate valid datetimes', () => {
    const value = generateDataForType(DataType.DateTime);
    expect(typeof value).toBe('string');
    expect(/^\d{4}-\d{2}-\d{2}T/.test(value as string)).toBe(true);
  });

  it('should generate valid emails', () => {
    const value = generateDataForType(DataType.Email);
    expect(typeof value).toBe('string');
    expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)).toBe(true);
  });

  it('should generate valid phone numbers', () => {
    const value = generateDataForType(DataType.Phone);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
  });

  it('should generate valid UUIDs', () => {
    const value = generateDataForType(DataType.UUID);
    expect(typeof value).toBe('string');
    expect(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value as string
      )
    ).toBe(true);
  });

  it('should generate a sample row', () => {
    const dataTypes = [DataType.Integer, DataType.String, DataType.Email];
    const row = generateSampleRow(dataTypes);

    expect(row.length).toBe(3);
    expect(validateGeneratedValue(row[0], DataType.Integer)).toBe(true);
    expect(validateGeneratedValue(row[1], DataType.String)).toBe(true);
    expect(validateGeneratedValue(row[2], DataType.Email)).toBe(true);
  });

  it('should generate multiple rows', () => {
    const dataTypes = [DataType.Integer, DataType.String];
    const rows = generateMultipleRows(dataTypes, 10);

    expect(rows.length).toBe(10);
    expect(rows[0].length).toBe(2);
  });

  it('should generate reproducible data with seed', () => {
    setGeneratorSeed(12345);
    const value1 = generateDataForType(DataType.Integer);

    setGeneratorSeed(12345);
    const value2 = generateDataForType(DataType.Integer);

    expect(value1).toBe(value2);
  });

  it('should pass generator test', () => {
    expect(testGenerators()).toBe(true);
  });
});
```

## Testing This Step

### 1. Manual Testing

Create a test file `src/test-generators.ts`:

```typescript
import { generateDataForType, testGenerators } from '@/lib/dataGenerators';
import { DataType } from '@/types';

console.log('Testing Data Generators...\n');

// Test each data type
Object.values(DataType).forEach((dataType) => {
  const value = generateDataForType(dataType);
  console.log(`${dataType}: ${value}`);
});

console.log('\nRunning generator test suite...');
const testResult = testGenerators();
console.log(`Test result: ${testResult ? '✅ PASS' : '❌ FAIL'}`);
```

Run:

```bash
npx tsx src/test-generators.ts
```

Expected output:

```
Testing Data Generators...

Integer: 4523
Float: 7234.56
Boolean: true
String: Lorem ipsum dolor sit amet consectetur.
Date: 2023-05-15
DateTime: 2023-05-15T14:30:22.123Z
Email: john.doe@example.com
Phone: +1-555-0123
UUID: 550e8400-e29b-41d4-a716-446655440000

Running generator test suite...
Test result: ✅ PASS
```

### 2. Type Check

```bash
pnpm type-check
```

Should complete with no errors.

### 3. Integration Test

Add to your `src/app/page.tsx` temporarily:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { generateDataForType } from '@/lib/dataGenerators';
import { DataType } from '@/types';

export default function Home() {
  const [samples, setSamples] = useState<Record<string, any>>({});

  useEffect(() => {
    const sampleData: Record<string, any> = {};
    Object.values(DataType).forEach((dataType) => {
      sampleData[dataType] = generateDataForType(dataType);
    });
    setSamples(sampleData);
  }, []);

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            CSV Generator
          </h1>
          <p className='text-gray-600 mb-8'>Data Generators Test</p>

          <div className='space-y-2'>
            {Object.entries(samples).map(([type, value]) => (
              <div key={type} className='flex gap-4'>
                <span className='font-semibold w-32'>{type}:</span>
                <span className='text-gray-600'>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
```

Run `pnpm dev` and check http://localhost:3000 - you should see generated sample data for each type.

## Common Issues & Solutions

### Issue: Faker.js import error

**Solution**: Ensure @faker-js/faker is installed:

```bash
pnpm add @faker-js/faker
```

### Issue: Type errors with generators

**Solution**: Ensure return types match the DataGenerator type definition.

### Issue: Invalid date formats

**Solution**: Check that date strings are properly formatted using `toISOString()`.

### Issue: Phone numbers not realistic

**Solution**: Faker.js phone numbers vary by locale. This is expected behavior.

## File Checklist

After completing this step, you should have:

- ✅ `src/lib/dataGenerators.ts` with all generator functions
- ✅ `src/lib/generatorUtils.ts` with utility functions
- ✅ `src/lib/generatorConfig.ts` with configuration
- ✅ All generators produce valid data
- ✅ Type checking passes

## Next Steps

Proceed to **Step 04: CSV Formatting Engine** where you'll:

- Implement CSV row formatting
- Handle quoting and escaping
- Support different delimiters and line endings
- Create the main CSV generation function

## Additional Resources

- [Faker.js Documentation](https://fakerjs.dev/guide/)
- [Faker.js API Reference](https://fakerjs.dev/api/)
- [Data Type Validation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

---

**Status**: ✅ Data generators implemented, ready for CSV formatting
