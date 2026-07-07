// CV/Resume Data Types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  linkedinUrl: string;
  portfolioUrl: string;
  summary: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
}

export type TemplateId = 
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'creative'
  | 'professional'
  | 'executive'
  | 'tech'
  | 'academic';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  industry: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface CustomizationOptions {
  templateId: TemplateId;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  fontSize: {
    heading: number;
    body: number;
  };
  spacing: {
    sectionGap: number;
    elementGap: number;
  };
  showPhoto: boolean;
  photoShape: 'circle' | 'square' | 'rounded';
  textDirection?: 'ltr' | 'rtl';
  fontStyle?: 'normal' | 'bold' | 'light' | 'italic';
}

export interface QRCodeConfig {
  enabled: boolean;
  url: string;
  size: number;
  style: 'square' | 'dots' | 'rounded';
}

export interface EmailConfig {
  recipient: string;
  subject: string;
  message: string;
}
