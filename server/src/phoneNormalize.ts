// Zambian phone number normalization, matching VICIdial's own native
// international-dialing convention (see the `omit_phone_code` campaign
// setting and AST_VDauto_dial.pl's dial-string builder, which concatenates
// dial_prefix + phone_code + phone_number): `vicidial_list.phone_number`
// should hold ONLY the local 9-digit number, with `phone_code` carrying the
// country code separately -- never both combined in phone_number.
export const ZM_COUNTRY_CODE = '260';

export interface NormalizedZmPhone {
  phoneCode: typeof ZM_COUNTRY_CODE;
  phoneNumber: string; // exactly 9 digits, no leading 0, no country code
}

// Accepts any of: bare 9-digit local ("977123456"), leading-0 10-digit local
// ("0977123456"), country-code-prefixed ("260977123456" or "+260977123456"),
// international-trunk-prefixed ("00260977123456"), or a messy double-prefixed
// input ("2600977123456") -- strips whichever wrapper is present and returns
// the clean 9-digit local number. Returns null if the result isn't a valid
// 9-digit Zambian local number (caller should treat that as a data problem,
// not silently guess).
export function normalizeZambianPhone(raw: string): NormalizedZmPhone | null {
  let digits = raw.replace(/\D/g, '');

  if (digits.startsWith(`00${ZM_COUNTRY_CODE}`)) digits = digits.slice(2);
  if (digits.startsWith(ZM_COUNTRY_CODE) && digits.length > 9) digits = digits.slice(3);
  if (digits.startsWith('0') && digits.length === 10) digits = digits.slice(1);

  if (!/^\d{9}$/.test(digits)) return null;
  return { phoneCode: ZM_COUNTRY_CODE, phoneNumber: digits };
}
