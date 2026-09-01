import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const CODE = 'VKU10'
const TEXT =
  'CHF 10 Rabatt auf deine Vorbereitung zur praktischen Fahrprüfung auf onlinedrivecoach.ch'

const Email = () => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Gutschein-Code {CODE} für onlinedrivecoach.ch</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Dein Gutschein-Code 🎁</Heading>
        <Text style={paragraph}>{TEXT}</Text>
        <Section style={codeBox}>
          <Text style={codeText}>{CODE}</Text>
        </Section>
        <Text style={paragraph}>
          Löse den Code bei deiner Anmeldung auf onlinedrivecoach.ch ein:
        </Text>
        <Button href="https://onlinedrivecoach.ch" style={button}>
          Zu onlinedrivecoach.ch
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          Du erhältst diese E-Mail, weil du auf vku-nothelferkurs.ch deinen
          Gutschein angefordert hast.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Dein Gutschein-Code für onlinedrivecoach.ch',
  displayName: 'Gutschein-Code',
  previewData: {},
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const heading = { fontSize: '22px', color: '#332b38', margin: '0 0 12px' }
const paragraph = { fontSize: '15px', lineHeight: '22px', color: '#4a4254' }
const codeBox = {
  backgroundColor: '#e7f6f2',
  borderRadius: '12px',
  textAlign: 'center' as const,
  padding: '18px',
  margin: '16px 0',
}
const codeText = {
  fontSize: '30px',
  fontWeight: 'bold' as const,
  letterSpacing: '3px',
  color: '#14957f',
  margin: '0',
}
const button = {
  backgroundColor: '#ff6b8a',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 22px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#eee6f0', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#8a8093' }
