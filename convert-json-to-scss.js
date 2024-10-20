const fs = require('fs');
const path = require('path');

// Paths to the JSON input and SCSS output
const tokensJsonPath = path.join(__dirname, 'tokens.json');
const outputScssPath = path.join(__dirname, 'dist', 'design-tokens.scss');

// Load the JSON file
const tokens = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));

// Function to escape values that contain commas (e.g., font-family strings)
function escapeScssValue(value) {
  if (typeof value === 'string' && value.includes(',')) {
    return `"${value}"`;  // Wrap in double quotes
  }
  return value;
}

// Function to convert JSON tokens to SCSS
function convertJsonToScss(tokens) {
  let scssContent = '';

  // Helper function to process nested objects (recursively)
  function processTokenGroup(groupTokens, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel); // Handle indentation for nested objects

    let result = '(\n';

    Object.keys(groupTokens).forEach((key) => {
      const value = groupTokens[key];

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects by recursively calling the function
        result += `${indent}  ${key}: ${processTokenGroup(value, indentLevel + 1)},\n`;
      } else {
        // Handle key-value pairs, and escape if needed
        result += `${indent}  ${key}: ${escapeScssValue(value)},\n`;
      }
    });

    result += `${indent})`;
    return result;
  }

  // Iterate through each category in the tokens JSON
  Object.keys(tokens).forEach((category) => {
    scssContent += `// ${category} tokens\n`;
    scssContent += `$${category}: ${processTokenGroup(tokens[category])};\n\n`;
  });

  return scssContent;
}

// Convert the JSON to SCSS
const scssContent = convertJsonToScss(tokens);

// Write the SCSS content to a file
fs.writeFileSync(outputScssPath, scssContent, 'utf8');

console.log(`SCSS tokens generated successfully at: ${outputScssPath}`);
