export default {
  minLength: 'Entry should be at least {0} character(s) long',
  maxLength: 'Entry should be no more than {0} character(s) long',
  required: 'This field is required',
  pattern: 'Entry does not match the required pattern',
  mask: 'All required positions should be filled',
  min: 'A value of at least {0} should be entered',
  max: 'A value no more than {0} should be entered',
  email: 'A valid email address should be entered',
  url: 'A valid url address should be entered',
  disabledDate: 'The entered value {0} is within the disabled dates range',
} as const;
