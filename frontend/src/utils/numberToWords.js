/**
 * Converts a number to Indian Rupee Words representation
 * e.g. 82997 -> "Eighty Two Thousand Nine Hundred Ninety Seven Only /-"
 * e.g. 154900 -> "One Lakh Fifty Four Thousand Nine Hundred Only /-"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n) {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToIndianWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Zero Only /-';
  
  const num = Math.round(Number(amount));
  if (num === 0) return 'Zero Only /-';
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

  let crores = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakhs = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousands = Math.floor(remainder / 1000);
  let hundreds = remainder % 1000;

  let words = '';

  if (crores > 0) {
    words += convertBelowThousand(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertBelowThousand(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertBelowThousand(thousands) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertBelowThousand(hundreds) + ' ';
  }

  return words.trim() + ' Only /-';
}

export function formatINR(val, decimals = 2) {
  const num = Number(val) || 0;
  const parts = num.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Indian Rupee grouping: last 3 digits, then groups of 2
  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  let formatted = otherNumbers !== '' 
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree 
    : lastThree;

  if (isNegative) formatted = '-' + formatted;

  return `₹${formatted}${decimalPart}`;
}
