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

interface Props {
  name: string
}

const Email = ({ name }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Anmeldung bei vku-nothelferkurs.ch ist eingegangen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Danke für deine Anmeldung!</Heading>
        <Text style={paragraph}>
          Wir haben die Anmeldung von <strong>{name}</strong> als Kursanbieter auf
          vku-nothelferkurs.ch erhalten.
        </Text>
        <Section style={box}>
          <Text style={boxText}>
            Wir prüfen deinen Eintrag manuell. Sobald er freigeschaltet ist, erhältst du eine
            weitere E-Mail und dein Eintrag ist öffentlich sichtbar.
          </Text>
        </Section>
        <Text style={paragraph}>
          Du kannst dich schon jetzt mit deiner E-Mail-Adresse und dem gewählten Passwort
          einloggen, um deine Angaben jederzeit zu ergänzen oder Kurstermine einzutragen.
        </Text>
        <Button href="https://vku-nothelferkurs.ch/auth" style={button}>
          Zum Login
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          Du erhältst diese E-Mail, weil du dich auf vku-nothelferkurs.ch als Kursanbieter
          registriert hast.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Deine Anmeldung bei vku-nothelferkurs.ch ist eingegangen',
  displayName: 'Anbieter-Registrierung erhalten',
  previewData: { name: 'Fahrschule Muster' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const heading = { fontSize: '22px', color: '#332b38', margin: '0 0 12px' }
const paragraph = { fontSize: '15px', lineHeight: '22px', color: '#4a4254' }
const box = {
  backgroundColor: '#e7f6f2',
  borderRadius: '12px',
  padding: '16px 18px',
  margin: '16px 0',
}
const boxText = { fontSize: '14px', lineHeight: '21px', color: '#14957f', margin: 0 }
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
