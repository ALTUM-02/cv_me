// ==================== GraphQL Response Types ====================

export interface GraphQLSuccessResponse {
  success: boolean;
  message?: string;
}

// ==================== Auth Types ====================

export interface GraphQLUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface TokenAuthPayload {
  token: string;
  payload: Record<string, unknown>;
  refreshExpiresIn?: number;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  user?: GraphQLUser;
}

// ==================== CV Types ====================

export interface GraphQLCVSummary {
  id: string;
  title: string;
  status: string;
  templateId: string;
  lastModified: string;
  createdAt: string;
}

export interface GraphQLPersonalInfo {
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

export interface GraphQLExperience {
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

export interface GraphQLEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface GraphQLSkill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export interface GraphQLLanguage {
  id: string;
  name: string;
  proficiency: string;
}

export interface GraphQLCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface GraphQLProject {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

export interface GraphQLColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface GraphQLFonts {
  heading: string;
  body: string;
}

export interface GraphQLFontSize {
  heading: number;
  body: number;
}

export interface GraphQLSpacing {
  sectionGap: number;
  elementGap: number;
}

export interface GraphQLCustomization {
  templateId: string;
  colors: GraphQLColors;
  fonts: GraphQLFonts;
  fontSize: GraphQLFontSize;
  spacing: GraphQLSpacing;
  showPhoto: boolean;
  photoShape: string;
  textDirection?: string;
  fontStyle?: string;
}

export interface GraphQLQRConfig {
  enabled: boolean;
  url: string;
  size: number;
  style: string;
}

export interface GraphQLCV {
  id: string;
  title: string;
  status: string;
  templateId: string;
  lastModified: string;
  personalInfo: GraphQLPersonalInfo;
  experiences: GraphQLExperience[];
  education: GraphQLEducation[];
  skills: GraphQLSkill[];
  languages: GraphQLLanguage[];
  certifications: GraphQLCertification[];
  projects: GraphQLProject[];
  customization: GraphQLCustomization;
  qrConfig: GraphQLQRConfig;
}

// ==================== Mutation Input Types ====================

export interface PersonalInfoInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  photo?: string;
}

export interface ExperienceInput {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface EducationInput {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface SkillInput {
  name?: string;
  level?: number;
  category?: string;
}

export interface LanguageInput {
  name?: string;
  proficiency?: string;
}

export interface CertificationInput {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface ProjectInput {
  name?: string;
  description?: string;
  url?: string;
  technologies?: string[];
  highlights?: string[];
}

export interface CustomizationInput {
  templateId?: string;
  colors?: Partial<GraphQLColors>;
  fonts?: Partial<GraphQLFonts>;
  fontSize?: Partial<GraphQLFontSize>;
  spacing?: Partial<GraphQLSpacing>;
  showPhoto?: boolean;
  photoShape?: string;
  textDirection?: string;
  fontStyle?: string;
}

export interface QRConfigInput {
  enabled?: boolean;
  url?: string;
  size?: number;
  style?: string;
}

export interface CVInput {
  title?: string;
  personalInfo?: PersonalInfoInput;
  customization?: CustomizationInput;
  qrConfig?: QRConfigInput;
}

// ==================== Dashboard Types ====================

export interface DashboardStatsData {
  totalUsers: number;
  totalCVs: number;
  activeToday: number;
  publishedCvs: number;
  userGrowthData: { month: string; users: number; cvs: number }[];
  templateUsageData: { name: string; value: number; color: string }[];
  dailyActivityData: { day: string; logins: number; cvsCreated: number }[];
  recentActivity: {
    id: string;
    user: string;
    action: string;
    detail: string;
    time: string;
    type: string;
  }[];
}
