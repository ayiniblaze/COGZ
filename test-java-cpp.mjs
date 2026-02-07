// Import the evaluator (this will use the compiled version from dist)
import { evaluateCode } from './dist/shared/codeEvaluator.js';

// TEST 1: BUGGY JAVA
console.log('===== TEST 1: BUGGY Java (missing semicolon) =====');
const buggyJava = 'public class Main { public static void main(String[] args) { int x = 5 System.out.println(x); } }';
const r1 = evaluateCode(buggyJava, 'java');
console.log('Code:', buggyJava);
console.log('Valid:', r1.isValid);
console.log('Errors found:', r1.errors.length);
if (r1.errors.length > 0) {
  console.log('Error messages:', r1.errors.map(e => e.message));
}
console.log('');

// TEST 2: CORRECT JAVA
console.log('===== TEST 2: CORRECT Java =====');
const correctJava = 'public class Main { public static void main(String[] args) { int x = 5; System.out.println(x); } }';
const r2 = evaluateCode(correctJava, 'java');
console.log('Code:', correctJava);
console.log('Valid:', r2.isValid);
console.log('Success Message:', r2.successMessage);
console.log('');

// TEST 3: BUGGY C++ (missing semicolon)
console.log('===== TEST 3: BUGGY C++ (missing semicolon) =====');
const buggyCpp = '#include <iostream>\nint main() {\n  std::cout << "hello"\n  return 0;\n}';
const r3 = evaluateCode(buggyCpp, 'cpp');
console.log('Code:', buggyCpp);
console.log('Valid:', r3.isValid);
console.log('Errors found:', r3.errors.length);
if (r3.errors.length > 0) {
  console.log('Error messages:', r3.errors.map(e => e.message));
}
console.log('');

// TEST 4: CORRECT C++
console.log('===== TEST 4: CORRECT C++ =====');
const correctCpp = '#include <iostream>\nint main() {\n  std::cout << "hello";\n  return 0;\n}';
const r4 = evaluateCode(correctCpp, 'cpp');
console.log('Code:', correctCpp);
console.log('Valid:', r4.isValid);
console.log('Success Message:', r4.successMessage);
console.log('');

// TEST 5: BUGGY C++ (missing main)
console.log('===== TEST 5: BUGGY C++ (missing main) =====');
const buggyNomain = '#include <iostream>\nint add(int a, int b) {\n  return a + b;\n}';
const r5 = evaluateCode(buggyNomain, 'c++');
console.log('Code:', buggyNomain);
console.log('Valid:', r5.isValid);
console.log('Errors found:', r5.errors.length);
if (r5.errors.length > 0) {
  console.log('Error messages:', r5.errors.map(e => e.message));
}
console.log('');

// TEST 6: BUGGY JAVA (no class)
console.log('===== TEST 6: BUGGY Java (no class definition) =====');
const buggyJavaNoClass = 'public static void main(String[] args) { System.out.println("hello"); }';
const r6 = evaluateCode(buggyJavaNoClass, 'java');
console.log('Code:', buggyJavaNoClass);
console.log('Valid:', r6.isValid);
console.log('Errors found:', r6.errors.length);
if (r6.errors.length > 0) {
  console.log('Error messages:', r6.errors.map(e => e.message));
}
