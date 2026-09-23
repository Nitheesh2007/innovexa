import { translations, translateString } from '../context/LanguageContext.js';

export function runTests() {
  console.log('🧪 Starting Language Translation Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (actual === expected) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}\n   Expected: "${expected}"\n   Actual:   "${actual}"`);
      failed++;
    }
  }

  // 1. Mandatory Prompt Test Cases
  assertEqual(
    translateString("Product Added Successfully"),
    "தயாரிப்பு வெற்றிகரமாக சேர்க்கப்பட்டது",
    "Product Added Successfully"
  );

  assertEqual(
    translateString("No products found"),
    "தயாரிப்புகள் எதுவும் கிடைக்கவில்லை",
    "No products found"
  );

  assertEqual(
    translateString("Total Sales"),
    "மொத்த விற்பனை",
    "Total Sales"
  );

  assertEqual(
    translateString("Select Category"),
    "வகையைத் தேர்ந்தெடுக்கவும்",
    "Select Category"
  );

  assertEqual(
    translateString("Add Product"),
    "தயாரிப்பைச் சேர்க்கவும்",
    "Add Product"
  );

  // 2. Dropdown Options & Categories from Prompt
  assertEqual(translateString("Category"), "வகை", "Category");
  assertEqual(translateString("Mobile Phones"), "மொபைல் போன்கள்", "Mobile Phones");
  assertEqual(translateString("Accessories"), "துணைக்கருவிகள்", "Accessories");
  assertEqual(translateString("Electrical Items"), "மின்சார பொருட்கள்", "Electrical Items");
  assertEqual(translateString("Other"), "மற்றவை", "Other");

  // 3. Validation and Error Messages from Prompt
  assertEqual(
    translateString("Product name is required."),
    "தயாரிப்பு பெயர் அவசியம்.",
    "Validation: Product name is required."
  );

  assertEqual(
    translateString("Invalid quantity."),
    "தவறான அளவு.",
    "Validation: Invalid quantity."
  );

  assertEqual(
    translateString("Failed to load products."),
    "தயாரிப்புகளை ஏற்ற முடியவில்லை.",
    "Error: Failed to load products."
  );

  // 4. Calendar and Date Requirement from Prompt
  // Example in Prompt: "User is on: Sales -> Monthly Sales -> September 2026"
  assertEqual(translateString("Sales"), "விற்பனை", "Sales");
  assertEqual(translateString("Monthly Sales"), "மாதாந்திர விற்பனை", "Monthly Sales");
  assertEqual(translateString("September 2026"), "செப்டம்பர் 2026", "September 2026");
  assertEqual(translateString("January"), "ஜனவரி", "January");
  assertEqual(translateString("December"), "டிசம்பர்", "December");
  assertEqual(translateString("Monday"), "திங்கள்", "Monday");
  assertEqual(translateString("Sunday"), "ஞாயிறு", "Sunday");

  // 5. Pattern Translations (numbers, units, relative dates)
  assertEqual(translateString("50 units"), "50 அலகுகள்", "Pattern: 50 units");
  assertEqual(translateString("15 units inward"), "15 அலகுகள் உள்ளே", "Pattern: 15 units inward");
  assertEqual(translateString("8 units outward"), "8 அலகுகள் வெளியே", "Pattern: 8 units outward");
  assertEqual(translateString("3 days ago"), "3 நாட்களுக்கு முன்", "Pattern: 3 days ago");

  // 6. Navigation and Core Modules
  assertEqual(translateString("Dashboard"), "முகப்புப்பலகை", "Dashboard");
  assertEqual(translateString("Inventory"), "சரக்கு இருப்பு", "Inventory");
  assertEqual(translateString("Asset Tracking"), "சொத்து கண்காணிப்பு", "Asset Tracking");
  assertEqual(translateString("Reports"), "அறிக்கைகள்", "Reports");
  assertEqual(translateString("Settings"), "அமைப்புகள்", "Settings");
  assertEqual(translateString("Invoices"), "விலைப்பட்டியல்கள்", "Invoices");

  console.log(`\n========================================`);
  console.log(`Result: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    throw new Error(`Language tests failed: ${failed} failed`);
  }
}
