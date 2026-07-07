import type { TemplateConfig } from '../types';

export const templates: TemplateConfig[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design with bold colors',
    industry: 'Technology, Startups',
    thumbnail: 'modern',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and elegant layout for formal industries',
    industry: 'Finance, Law, Government',
    thumbnail: 'classic',
    colors: {
      primary: '#1e3a5f',
      secondary: '#2c5282',
      accent: '#3182ce',
      text: '#2d3748',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Lato',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean design focusing on content',
    industry: 'Design, Architecture',
    thumbnail: 'minimal',
    colors: {
      primary: '#374151',
      secondary: '#4b5563',
      accent: '#6b7280',
      text: '#111827',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and artistic template for creative professionals',
    industry: 'Marketing, Advertising, Media',
    thumbnail: 'creative',
    colors: {
      primary: '#9333ea',
      secondary: '#a855f7',
      accent: '#c084fc',
      text: '#1f2937',
      background: '#faf5ff',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Nunito',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Polished and business-oriented design',
    industry: 'Consulting, Business',
    thumbnail: 'professional',
    colors: {
      primary: '#0f766e',
      secondary: '#0d9488',
      accent: '#14b8a6',
      text: '#134e4a',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Raleway',
      body: 'Roboto',
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Premium template for senior leadership roles',
    industry: 'Executive, Management',
    thumbnail: 'executive',
    colors: {
      primary: '#1c1917',
      secondary: '#292524',
      accent: '#d97706',
      text: '#1c1917',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Lato',
    },
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Modern template optimized for technical roles',
    industry: 'Software Engineering, IT',
    thumbnail: 'tech',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      text: '#064e3b',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
    },
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Formal template for academic and research positions',
    industry: 'Education, Research',
    thumbnail: 'academic',
    colors: {
      primary: '#7c2d12',
      secondary: '#9a3412',
      accent: '#ea580c',
      text: '#431407',
      background: '#ffffff',
    },
    fonts: {
      heading: 'EB Garamond',
      body: 'Source Serif Pro',
    },
  },
];

export const getTemplate = (id: string) => templates.find((t) => t.id === id) || templates[0];

export const colorPresets = [
  { name: 'Ocean Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#60a5fa' },
  { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#34d399' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c' },
  { name: 'Cherry Red', primary: '#dc2626', secondary: '#b91c1c', accent: '#f87171' },
  { name: 'Midnight', primary: '#1e293b', secondary: '#0f172a', accent: '#475569' },
  { name: 'Teal', primary: '#0d9488', secondary: '#0f766e', accent: '#2dd4bf' },
  { name: 'Rose', primary: '#e11d48', secondary: '#be123c', accent: '#fb7185' },
  { name: 'Indigo', primary: '#4f46e5', secondary: '#4338ca', accent: '#818cf8' },
  { name: 'Amber', primary: '#d97706', secondary: '#b45309', accent: '#fbbf24' },
];

export const fontOptions = [
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'EB Garamond', category: 'Serif' },
  { name: 'Cormorant Garamond', category: 'Serif' },
  { name: 'Source Serif Pro', category: 'Serif' },
  { name: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Source Sans Pro', category: 'Sans-Serif' },
  { name: 'Lato', category: 'Sans-Serif' },
  { name: 'Open Sans', category: 'Sans-Serif' },
  { name: 'Poppins', category: 'Sans-Serif' },
  { name: 'Nunito', category: 'Sans-Serif' },
  { name: 'Raleway', category: 'Sans-Serif' },
  { name: 'Roboto', category: 'Sans-Serif' },
  { name: 'Space Grotesk', category: 'Sans-Serif' },
  { name: 'Inter', category: 'Sans-Serif' },
];
