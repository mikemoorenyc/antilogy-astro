import { resend } from './resend';
import { turnstile } from './validateTurnstile';
import { settings } from './settings';
import {media} from "./cloudinary"

export const server = {
  turnstile,resend,settings,media
}
