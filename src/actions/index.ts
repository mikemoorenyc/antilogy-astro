import { resend } from './resend';
import { turnstile } from './validateTurnstile';
import { settings } from './settings';

export const server = {
  turnstile,resend,settings
}
