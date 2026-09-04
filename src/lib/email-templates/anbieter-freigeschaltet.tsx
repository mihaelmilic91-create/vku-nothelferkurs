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
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name: string
  slug: string
}

const Email = ({ name, slug }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Eintrag «{name}» ist jetzt live auf vku-nothelferkurs.ch</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Dein Eintrag ist live! 🎉</Heading>
        <Text style={paragraph}>
          Gute Nachrichten — dein Eintrag <strong>{name}</strong> wurde geprüft und ist jetzt
          öffentlich auf vku-nothelferkurs.ch sichtbar.
        </Text>
        <Button href={`https://vku-nothelferkurs.ch/anbieter/${slug}`} style={button}>
          Meinen Eintrag ansehen
        </Button>
        <Text style={paragraph}>
          Über dein Konto kannst du jederzeit deine Angaben aktualisieren und Kurstermine
          eintragen.
        </Text>
        <Text style={paragraph}>
          <a href="https://vku-nothelferkurs.ch/mein-konto" style={link}>
            Zu meinem Konto
          </a>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Du erhältst diese E-Mail, weil dein Eintrag als Kursanbieter auf vku-nothelferkurs.ch
          soeben freigeschaltet wurde.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) => `Dein Eintrag «${data.name}» ist jetzt live auf vku-nothelferkurs.ch`,
  displayName: 'Anbieter freigeschaltet',
  previewData: { name: 'Fahrschule Muster', slug: 'fahrschule-muster-ab12c' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const heading = { fontSize: '22px', color: '#332b38', margin: '0 0 12px' }
const paragraph = { fontSize: '15px', lineHeight: '22px', color: '#4a4254' }
const link = { color: '#14957f', fontWeight: 'bold' as const }
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
