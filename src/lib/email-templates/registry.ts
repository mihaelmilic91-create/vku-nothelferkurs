import type { ComponentType } from 'react'
import { template as gutscheinCodeTemplate } from './gutschein-code'
import { template as anbieterRegistrierungErhaltenTemplate } from './anbieter-registrierung-erhalten'
import { template as anbieterFreigeschaltetTemplate } from './anbieter-freigeschaltet'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'gutschein-code': gutscheinCodeTemplate,
  'anbieter-registrierung-erhalten': anbieterRegistrierungErhaltenTemplate,
  'anbieter-freigeschaltet': anbieterFreigeschaltetTemplate,
}
