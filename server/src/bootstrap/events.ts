/**
 * Register in-process domain event subscribers once at boot.
 * Do not import this from route files — only from app.ts.
 */

import { registerAuditHandlers } from '../modules/audit/audit.events.js';
import { registerAlertHandlers } from '../modules/alerts/alert.events.js';
import { registerNotificationHandlers } from '../modules/notifications/notification.events.js';

export function registerDomainEvents(): void {
  registerAuditHandlers();
  registerAlertHandlers();
  registerNotificationHandlers();
}
