// Import the evaluator functions
import { evaluateCode } from './src/shared/codeEvaluator.ts';

console.log('=== TEST 1: BUGGY JavaScript Code ===');
const buggyJS = 'function add(a, b { return a + b; }'; // Missing closing )
const result1 = evaluateCode(buggyJS, 'javascript');
console.log('Code:', buggyJS);
console.log('Is Valid:', result1.isValid);
console.log('Errors:', result1.errors.map(e => e.message));
console.log('Success Message:', result1.successMessage);
console.log('');

console.log('=== TEST 2: CORRECT JavaScript Code ===');
const correctJS = 'function add(a, b) { return a + b; }';
const result2 = evaluateCode(correctJS, 'javascript');
console.log('Code:', correctJS);
console.log('Is Valid:', result2.isValid);
console.log('Errors:', result2.errors);
console.log('Success Message:', result2.successMessage);
console.log('Guidance:', result2.guidance);
console.log('');

console.log('=== TEST 3: PARTIAL JavaScript Code (like in history) ===');
const partialJS = 'function sum(arr)';
const result3 = evaluateCode(partialJS, 'javascript');
console.log('Code:', partialJS);
console.log('Is Valid:', result3.isValid);
console.log('Errors:', result3.errors);
console.log('Success Message:', result3.successMessage);
console.log('');

console.log('=== TEST 4: BUGGY Python Code ===');
const buggyPython = 'if x > 5\n  print("hello")'; // Missing colon
const result4 = evaluateCode(buggyPython, 'python');
console.log('Code:', buggyPython);
console.log('Is Valid:', result4.isValid);
console.log('Errors:', result4.errors.map(e => e.message));
console.log('Success Message:', result4.successMessage);
console.log('');

console.log('=== TEST 5: CORRECT Python Code ===');
const correctPython = 'def factorial(n):\n  return n';
const result5 = evaluateCode(correctPython, 'python');
console.log('Code:', correctPython);
console.log('Is Valid:', result5.isValid);
console.log('Errors:', result5.errors);
console.log('Success Message:', result5.successMessage);
