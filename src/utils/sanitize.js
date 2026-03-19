// src/utils/sanitize.js
// Comprehensive input sanitization utilities for XSS, injection, and data validation

const MAX_INPUT_LENGTH = 500;
const MAX_TEXTAREA_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>'"`;]/g, '')
    .substring(0, MAX_INPUT_LENGTH);
};

export const sanitizeName = (name) => {
  if (typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[<>"'`;\\]/g, '')
    .replace(/\d{13,}/g, '')
    .substring(0, MAX_NAME_LENGTH);
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().substring(0, MAX_EMAIL_LENGTH);
};

export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^+\d\s\-()]/g, '').substring(0, 20);
};

export const sanitizeTextArea = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"`;]/g, '')
    .substring(0, MAX_TEXTAREA_LENGTH);
};

export const sanitizeNumeric = (value) => {
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : Math.max(0, num);
};

export const sanitizeArrayOfIds = (arr) => {
  if (!Array.isArray(arr)) return [];
  const oidRegex = /^[a-f\d]{24}$/i;
  return arr.filter(id => oidRegex.test(String(id)));
};

export const sanitizeBookingInput = (data) => {
  return {
    purpose: sanitizeString(data.purpose),
    venue: sanitizeString(data.venue),
    tripDate: data.tripDate,
    departureTime: sanitizeString(data.departureTime),
    returnTime: sanitizeString(data.returnTime),
    students: {
      form1: sanitizeNumeric(data.students?.form1),
      form2: sanitizeNumeric(data.students?.form2),
      form3: sanitizeNumeric(data.students?.form3),
      form4: sanitizeNumeric(data.students?.form4),
    },
    accompanyingTeachers: sanitizeArrayOfIds(data.accompanyingTeachers),
  };
};

export const validateAndSanitizeLogin = (data) => {
  const sanitized = {};
  
  if (data.identifier) {
    const trimmed = data.identifier.trim();
    if (trimmed.includes('@')) {
      sanitized.email = sanitizeEmail(trimmed);
    } else {
      sanitized.teacherId = trimmed.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    }
  }
  
  if (data.password) {
    sanitized.password = data.password;
  }
  
  return sanitized;
};

export const validateAndSanitizeRegistration = (data) => {
  return {
    name: sanitizeName(data.name),
    teacherId: data.teacherId ? sanitizeString(data.teacherId).substring(0, 10) : undefined,
    email: data.email ? sanitizeEmail(data.email) : undefined,
    password: data.password,
    phoneNumber: data.phoneNumber ? sanitizePhone(data.phoneNumber) : undefined,
  };
};
