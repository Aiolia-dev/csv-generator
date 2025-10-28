CSV Generator - Functional Specification Document

1. Project Overview
   1.1 Purpose
   The CSV Generator is a web application that allows users to dynamically generate CSV files with customizable structures and data types. The application provides a user-friendly interface for configuring file characteristics, column specifications, and CSV formatting options without requiring any backend services or external APIs.
   1.2 Scope
   This application is designed to:

Generate CSV files entirely in the browser (client-side)
Support various data types with realistic random data generation
Provide extensive customization of CSV format and structure
Offer immediate download of generated files
Work offline once loaded (no server dependencies)

1.3 Target Users

QA Engineers needing test data
Developers requiring sample datasets
Data analysts creating mock data for prototyping
Anyone needing custom CSV files for testing or demonstration purposes

2. Functional Requirements
   2.1 File Structure Configuration
   2.1.1 Total Data Rows

Type: Numeric input
Default: 100
Range: 1 to 1,000,000
Behavior: Specifies the number of data rows to generate (excluding header and footer)
Validation: Must be a positive integer
Note: Disabled when "Target File Size" mode is active

2.1.2 Target File Size (Optional)

Type: Numeric input with checkbox toggle
Unit: Megabytes (MB)
Default: Unchecked/disabled
Range: 0.01 to 1000 MB
Behavior: When enabled, the application calculates the number of rows needed to approximate the target file size
Validation: Must be a positive number
Note: Mutually exclusive with "Total Data Rows" - enabling this disables the row count input

2.1.3 Header Lines

Type: Numeric input
Default: 1
Range: 0 to 100
Behavior:

0: No header
1: Single header row with column names
2+: First row contains column names, subsequent header rows contain metadata or additional information

Validation: Must be a non-negative integer

2.1.4 Footer Lines

Type: Numeric input
Default: 0
Range: 0 to 100
Behavior: Number of footer lines to append at the end of the file (e.g., for totals, summaries, or metadata)
Validation: Must be a non-negative integer

2.2 CSV Format Options
2.2.1 Delimiter

Type: Dropdown selection
Options:

Comma (,) - Default
Semicolon (;)
Tab (\t)
Pipe (|)

Behavior: Character used to separate fields in each row

2.2.2 Quote Character

Type: Dropdown selection
Options:

Double Quote (") - Default
Single Quote (')
None (no quoting)

Behavior: Character used to wrap field values when necessary

2.2.3 Escape Character

Type: Text input (single character)
Default: Backslash (\)
Behavior: Character used to escape special characters within quoted fields
Validation: Must be a single character or empty

2.2.4 Line Ending

Type: Dropdown selection
Options:

LF (Unix) - \n - Default
CRLF (Windows) - \r\n
CR (Old Mac) - \r

Behavior: Line terminator style for CSV rows

2.2.5 Encoding

Type: Dropdown selection
Options:

UTF-8 - Default
UTF-16
ASCII
ISO-8859-1 (Latin-1)

Behavior: Character encoding for the generated file

2.2.6 Quote All Fields

Type: Checkbox
Default: Unchecked
Behavior:

Unchecked: Only quote fields containing special characters (delimiter, newlines, quotes)
Checked: Quote every field regardless of content

Impact:

Increases file size
Improves compatibility with strict parsers
Preserves leading zeros and data type formatting

2.3 Column Configuration
2.3.1 Column Management

Add Column: Button to add a new column to the configuration
Remove Column: Button (trash icon) to delete a specific column
Reorder Columns: Drag handle (visual indicator) for potential drag-and-drop functionality
Default Columns: Application starts with 3 sample columns (id, name, email)

2.3.2 Column Properties
Column Name

Type: Text input
Required: Yes
Validation:

Must not be empty
Should warn on duplicate column names
Recommended: Alphanumeric and underscores only

Behavior: Used as the header value in the CSV file

Data Type

Type: Dropdown selection
Required: Yes
Options:

Integer: Whole numbers
Float: Decimal numbers
Boolean: True/false values
String: Text data (lorem ipsum based)
Date: Date values (YYYY-MM-DD format)
DateTime: Date and time values (ISO 8601 format)
Email: Valid email addresses
Phone: Phone numbers in various formats
UUID: Universally unique identifiers (v4)

2.4 Preview and Generation
2.4.1 Estimated File Size

Display: Real-time calculation shown in the generation section
Formula: Approximate based on:

Number of columns
Average data length per data type
Total rows (including header and footer)
Delimiter and quote characters

Format: Display in MB (or KB if < 1MB)

2.4.2 Total Lines Display

Calculation: Header Lines + Total Data Rows + Footer Lines
Display: Shown in the generation section

2.4.3 Preview Button

Behavior: Generates and displays the first 10-20 rows of the CSV
Display: Modal or expandable section showing formatted CSV content
Purpose: Allow users to verify configuration before generating large files

2.4.4 Generate CSV Button

Behavior:

Validates all configuration
Generates the complete CSV data
Creates a downloadable file
Triggers browser download

File Name: generated_data_YYYYMMDD_HHMMSS.csv
Error Handling: Display user-friendly messages for any issues

3. Technical Specifications
   3.1 Technology Stack
   Frontend Framework

React (18+)
JavaScript/JSX
Tailwind CSS for styling
Lucide React for icons

Data Generation Library

@faker-js/faker (version 8+)
Why Faker.js:

Comprehensive data type coverage
Realistic, locale-aware data generation
No API calls required (client-side only)
Well-maintained and popular (~50k+ GitHub stars)
Supports multiple locales
Lightweight enough for browser use (~1MB)

File Generation

Blob API for creating downloadable files
URL.createObjectURL() for download links
No server-side processing required

3.2 Data Generation Specifications
3.2.1 Faker.js Integration
javascriptimport { faker } from '@faker-js/faker';

// Data type mapping
const dataGenerators = {
Integer: () => faker.number.int({ min: 1, max: 10000 }),
Float: () => faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
Boolean: () => faker.datatype.boolean(),
String: () => faker.lorem.sentence({ min: 3, max: 10 }),
Date: () => faker.date.between({
from: '2020-01-01',
to: '2025-12-31'
}).toISOString().split('T')[0],
DateTime: () => faker.date.between({
from: '2020-01-01',
to: '2025-12-31'
}).toISOString(),
Email: () => faker.internet.email(),
Phone: () => faker.phone.number(),
UUID: () => faker.string.uuid()
};
3.2.2 Data Generation Strategy
For each row:

Iterate through all configured columns
Call the appropriate generator based on column data type
Apply quoting rules based on delimiter and "Quote All Fields" setting
Escape special characters if present
Concatenate fields with delimiter

Performance Considerations:

Generate data in chunks for large files (e.g., 10,000 rows at a time)
Use Web Workers for files > 100MB to avoid blocking UI
Show progress indicator for large file generation

3.3 CSV Generation Algorithm
javascriptfunction generateCSV(config, columns) {
let csvContent = '';
const { delimiter, quoteChar, escapeChar, lineEnding, quoteAll } = config;

// 1. Generate Header Lines
if (config.headerLines > 0) {
// First header: column names
csvContent += formatRow(columns.map(col => col.name), config);

    // Additional headers: metadata or custom text
    for (let i = 1; i < config.headerLines; i++) {
      csvContent += formatRow(generateHeaderMetadata(i), config);
    }

}

// 2. Generate Data Rows
for (let i = 0; i < config.totalRows; i++) {
const row = columns.map(col => generateDataForType(col.dataType));
csvContent += formatRow(row, config);
}

// 3. Generate Footer Lines
for (let i = 0; i < config.footerLines; i++) {
csvContent += formatRow(generateFooterData(i), config);
}

return csvContent;
}

function formatRow(values, config) {
const formattedValues = values.map(value => {
const stringValue = String(value);
const needsQuoting = config.quoteAll ||
stringValue.includes(config.delimiter) ||
stringValue.includes('\n') ||
stringValue.includes(config.quoteChar);

    if (needsQuoting && config.quoteChar) {
      // Escape existing quote characters
      const escaped = stringValue.replace(
        new RegExp(config.quoteChar, 'g'),
        config.escapeChar + config.quoteChar
      );
      return config.quoteChar + escaped + config.quoteChar;
    }

    return stringValue;

});

return formattedValues.join(config.delimiter) + config.lineEnding;
}
3.4 File Size Calculation
When "Target File Size" mode is enabled:
javascriptfunction calculateRowsForFileSize(targetSizeMB, columns, config) {
// Calculate average row size
const sampleRows = 100;
let totalBytes = 0;

for (let i = 0; i < sampleRows; i++) {
const row = columns.map(col => generateDataForType(col.dataType));
const formattedRow = formatRow(row, config);
totalBytes += new Blob([formattedRow]).size;
}

const avgRowSize = totalBytes / sampleRows;
const targetBytes = targetSizeMB _ 1024 _ 1024;

// Account for header and footer
const headerFooterBytes = (config.headerLines + config.footerLines) \* avgRowSize;
const availableBytes = targetBytes - headerFooterBytes;

return Math.floor(availableBytes / avgRowSize);
}

4. User Interface Requirements
   4.1 Layout

Single-page application
Responsive design: Should work on desktop (primary), tablet, and mobile
Sections arranged vertically:

Header (title and description)
File Structure
CSV Format Options
Column Configuration
Preview & Generation

4.2 Visual Design

Color scheme: Blue/indigo gradient background, white content area
Typography: Clear, readable fonts with appropriate hierarchy
Spacing: Generous padding and margins for clarity
Shadows: Subtle shadows for depth and card separation

4.3 Interactive Elements

Buttons: Clear hover states and visual feedback
Inputs: Focus states with colored borders
Validation: Inline error messages in red
Loading states: Spinner or progress bar for generation process
Disabled states: Visual indication when options are unavailable

4.4 Accessibility

Labels: All form inputs must have associated labels
Keyboard navigation: Full keyboard support for all interactive elements
ARIA labels: For icon buttons and interactive elements
Focus indicators: Visible focus states for keyboard navigation
Color contrast: WCAG AA compliant contrast ratios

5. Validation Rules
   5.1 Input Validation
   FieldValidation RuleError MessageTotal Data RowsMust be > 0 and ≤ 1,000,000"Please enter a value between 1 and 1,000,000"Target File SizeMust be > 0 and ≤ 1000 MB"Please enter a value between 0.01 and 1000 MB"Header LinesMust be ≥ 0 and ≤ 100"Please enter a value between 0 and 100"Footer LinesMust be ≥ 0 and ≤ 100"Please enter a value between 0 and 100"Column NameMust not be empty"Column name is required"Column NameShould be unique (warning)"Duplicate column name detected"Escape CharacterMust be single character or empty"Escape character must be a single character"
   5.2 Configuration Validation
   Pre-generation checks:

At least one column must be configured
All column names must be non-empty
If target file size exceeds 500MB, show warning about generation time
If total rows exceed 500,000, show warning about browser memory

5.3 Browser Compatibility
Warn users if:

Browser doesn't support Blob API
Browser doesn't support File download
Available memory might be insufficient for large files

6. Error Handling
   6.1 User-Facing Errors
   Error ScenarioUser MessageSuggested ActionInvalid configuration"Please check your configuration settings"Highlight invalid fields in redFile too large for browser"File size exceeds browser capabilities (max 500MB)"Suggest reducing rows or file sizeGeneration failed"Unable to generate CSV file. Please try again."Reset form or retry generationDownload failed"Unable to download file. Please check browser permissions."Check browser download settings
   6.2 Graceful Degradation

If Faker.js fails to load: Fall back to simple random generators
If Web Workers not supported: Generate synchronously with warning
If download fails: Provide copy-to-clipboard option

7. Performance Considerations
   7.1 Optimization Strategies
   Small files (< 10MB):

Generate synchronously in main thread
Instant download

Medium files (10MB - 100MB):

Generate in chunks
Show progress indicator
Use requestAnimationFrame for UI updates

Large files (> 100MB):

Use Web Workers for generation
Show detailed progress (percentage, rows generated)
Allow cancellation
Warn about memory usage

7.2 Memory Management

Clear data from memory after download
Revoke object URLs after use
Implement chunk-based generation for large datasets

8. Future Enhancements (Out of Scope for MVP)
   8.1 Advanced Features

Save/Load Configuration: Export configuration as JSON for reuse
Configuration Templates: Pre-defined templates (e.g., "E-commerce Orders", "User Database")
Column Dependencies: Link columns (e.g., first name + last name = email)
Advanced Data Generation:

Custom regex patterns
Value ranges and constraints
Null/empty value percentage control
Unique value enforcement
Sequential numbering

Bulk Export: Generate multiple CSV files with variations

8.2 UI Enhancements

Dark mode toggle
Drag-and-drop column reordering (functional, not just visual)
Column duplication for faster configuration
Import existing CSV to extract structure
Real-time preview as settings change

8.3 Advanced CSV Features

Multi-value cells (arrays within cells)
Nested JSON within CSV fields
Custom header/footer text input
Data relationships (foreign keys between columns)
Statistical distributions (normal, uniform, etc.)

8.4 Export Options

Multiple format support: TSV, Excel, JSON, XML
Compressed output: Generate ZIP files for large datasets
Cloud export: Direct upload to Google Drive, Dropbox

9. Testing Requirements
   9.1 Unit Tests

Data generator functions for each data type
CSV formatting logic (quoting, escaping, delimiters)
File size estimation accuracy
Input validation functions

9.2 Integration Tests

Complete CSV generation workflow
Configuration state management
File download process

9.3 Browser Testing

Chrome (latest 2 versions)
Firefox (latest 2 versions)
Safari (latest 2 versions)
Edge (latest 2 versions)

9.4 Performance Testing

Generation time for various file sizes (1MB, 10MB, 100MB)
Memory usage during generation
Browser responsiveness during generation

9.5 Manual Testing Scenarios

Generate CSV with all default settings
Generate CSV with custom delimiter and quotes
Generate large file (100MB+) and verify completion
Test all data types and verify realistic output
Test edge cases (0 rows, 1 row, max rows)
Test with duplicate column names
Test quote all fields vs selective quoting
Verify file encoding in different text editors

10. Deployment
    10.1 Build Requirements

Node.js 18+ for development
npm or yarn for package management
Build tool (Vite, Create React App, or Next.js)

10.2 Hosting Options

Static hosting: Netlify, Vercel, GitHub Pages, AWS S3
Requirements: HTTPS enabled, supports single-page applications

10.3 Bundle Size

Target: < 2MB total bundle size
Optimization: Code splitting, tree shaking, minification

11. Dependencies
    11.1 Core Dependencies
    json{
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@faker-js/faker": "^8.0.0",
    "lucide-react": "^0.263.1"
    }
    11.2 Dev Dependencies
    json{
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
    }

12. Documentation Requirements
    12.1 User Documentation

Quick Start Guide: 5-step guide to generating first CSV
Data Types Reference: Description of each data type with examples
CSV Format Explanation: What each format option does
FAQ: Common questions and troubleshooting

12.2 Developer Documentation

Setup Instructions: How to run locally
Architecture Overview: Component structure and data flow
Adding New Data Types: How to extend with custom generators
Build and Deployment: How to build and deploy the application

13. Success Criteria
    The project will be considered successful when:

✅ Users can generate CSV files with custom configurations
✅ All 9 data types generate realistic data
✅ Files up to 100MB generate without browser crashes
✅ CSV format options produce valid CSV files
✅ Download works in all major browsers
✅ UI is intuitive and requires no documentation for basic use
✅ Generation time is < 5 seconds for files under 10MB
✅ No external API calls or server dependencies required

14. Revision History
    VersionDateAuthorChanges1.02025-10-28InitialFirst version of functional specification

Appendix A: Example CSV Outputs
A.1 Standard CSV (Comma delimiter, Minimal quoting)
csvid,name,email,created_at
1,John Smith,john.smith@example.com,2024-03-15
2,Jane Doe,jane.doe@test.com,2024-03-16
3,"Bob Lee, Jr.",bob.lee@email.com,2024-03-17
A.2 Semicolon Delimiter with Quote All
csv"id";"name";"email";"created_at"
"1";"John Smith";"john.smith@example.com";"2024-03-15"
"2";"Jane Doe";"jane.doe@test.com";"2024-03-16"
"3";"Bob Lee, Jr.";"bob.lee@email.com";"2024-03-17"
A.3 With Header and Footer
csv# CSV Generated: 2024-10-28 14:30:00

# Total Records: 3

id,name,email,created_at
1,John Smith,john.smith@example.com,2024-03-15
2,Jane Doe,jane.doe@test.com,2024-03-16
3,"Bob Lee, Jr.",bob.lee@email.com,2024-03-17

# End of file

# Generated by CSV Generator v1.0

Appendix B: Data Type Examples
Data TypeExample OutputNotesInteger42, 1337, 999Whole numbersFloat3.14, 99.99, 0.01Decimal precisionBooleantrue, falseOr 1/0, yes/no based on future configString"Lorem ipsum dolor sit amet"Realistic sentencesDate2024-10-28ISO 8601 date formatDateTime2024-10-28T14:30:00.000ZISO 8601 full formatEmailjohn.doe@example.comValid email formatPhone+1-555-123-4567International formatUUID550e8400-e29b-41d4-a716-446655440000v4 UUID
