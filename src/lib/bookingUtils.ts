import Booking from '@/models/Booking';

/**
 * Generates a random 6-character booking code with capital letters and numbers
 * Format: OJKA22, F48G22, etc.
 */
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a unique booking code that doesn't exist in the database
 */
export async function generateUniqueBookingCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateBookingCode();
    
    try {
      const existingBooking = await Booking.findOne({ bookingCode: code });
      isUnique = !existingBooking;
    } catch (error) {
      console.error('Error checking booking code uniqueness:', error);
      // If database check fails, continue with the generated code
      isUnique = true;
    }
    
    attempts++;
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-4);
    code = generateBookingCode().slice(0, 2) + timestamp;
  }

  return code;
}

/**
 * Validates booking code format
 */
export function isValidBookingCode(code: string): boolean {
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
}

/**
 * Calculates total booking amount based on pricing and number of members
 */
export function calculateBookingAmount(pricePerPerson: number, memberCount: number): number {
  if (memberCount < 1 || memberCount > 5) {
    throw new Error('Member count must be between 1 and 5');
  }
  
  return pricePerPerson * memberCount;
}

/**
 * Validates member data
 */
export function validateMemberData(members: Array<{ name: string; email: string; phone: string }>): string[] {
  const errors: string[] = [];
  
  if (!members || members.length === 0) {
    errors.push('At least one member is required');
    return errors;
  }
  
  if (members.length > 5) {
    errors.push('Maximum 5 members allowed per booking');
  }
  
  members.forEach((member, index) => {
    const memberNum = index + 1;
    
    if (!member.name || member.name.trim().length === 0) {
      errors.push(`Member ${memberNum}: Name is required`);
    }
    
    if (!member.email || member.email.trim().length === 0) {
      errors.push(`Member ${memberNum}: Email is required`);
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(member.email)) {
        errors.push(`Member ${memberNum}: Invalid email format`);
      }
    }
    
    if (!member.phone || member.phone.trim().length === 0) {
      errors.push(`Member ${memberNum}: Phone number is required`);
    } else {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(member.phone)) {
        errors.push(`Member ${memberNum}: Invalid phone number format`);
      }
    }
  });
  
  // Check for duplicate emails
  const emails = members.map(m => m.email.toLowerCase());
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    errors.push('Duplicate email addresses are not allowed');
  }
  
  return errors;
}

/**
 * Formats booking confirmation data for email
 */
export function formatBookingConfirmation(booking: any) {
  return {
    bookingCode: booking.bookingCode,
    eventTitle: booking.eventTitle,
    date: new Date(booking.selectedDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: booking.selectedTime,
    pricing: booking.selectedPricing,
    totalAmount: booking.totalAmount,
    memberCount: booking.members.length,
    members: booking.members,
    primaryContact: booking.primaryContact
  };
}
