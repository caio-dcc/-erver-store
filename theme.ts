'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

const rubyRed: MantineColorsTuple = [
  '#fef2f2',
  '#fee2e2',
  '#fecaca',
  '#fca5a5',
  '#f87171',
  '#ef4444',
  '#dc2626',
  '#b91c1c',
  '#991b1b',
  '#7f1d1d',
];

const strongBlue: MantineColorsTuple = [
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#93c5fd',
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#1e3a8a',
];


export const theme = createTheme({
  colors: {
    rubyRed,
    strongBlue,
  },
  primaryColor: 'rubyRed',

  fontFamily: 'var(--font-electrolize), sans-serif',
  headings: {
    fontWeight: '700',
    fontFamily: 'var(--font-electrolize), sans-serif',
  },
  components: {
    Paper: {
      defaultProps: {
        bg: '#0b0b0b',
        c: '#ffffff',
      },
      styles: {
        root: {
          border: '1px solid #1a1a1a',
        }
      }
    },
    Table: {
      styles: {
        table: {
          color: '#ffffff',
        },
        thead: {
          backgroundColor: '#000000',
        },
        tr: {
          borderBottom: '1px solid #1a1a1a',
        }
      }
    },
    Button: {
      defaultProps: {
        color: 'rubyRed',
      },

      styles: {
        root: {
          fontWeight: 700,
          fontSize: '1.1rem',
        }
      }
    },
    Text: {
      defaultProps: {
        fw: 500,
      }
    }
  },
});

