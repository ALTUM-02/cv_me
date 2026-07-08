import { create } from 'zustand';
import { apolloClient } from '../api/graphql';
import {
  CREATE_CV,
  DELETE_CV,
  UPDATE_PERSONAL_INFO,
  UPDATE_CUSTOMIZATION,
  UPDATE_QR_CONFIG,
  CREATE_EXPERIENCE,
  UPDATE_EXPERIENCE,
  DELETE_EXPERIENCE,
  CREATE_EDUCATION,
  UPDATE_EDUCATION,
  DELETE_EDUCATION,
  CREATE_SKILL,
  UPDATE_SKILL,
  DELETE_SKILL,
  CREATE_LANGUAGE,
  UPDATE_LANGUAGE,
  DELETE_LANGUAGE,
  CREATE_CERTIFICATION,
  UPDATE_CERTIFICATION,
  DELETE_CERTIFICATION,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
} from '../api/graphql/mutations';
import { GET_ALL_CVS as GET_ALL_CVS_QUERY, GET_CV } from '../api/graphql/queries';
import type {
  CVData,
  CustomizationOptions,
  QRCodeConfig,
  TemplateId,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
} from '../types';
import type { GraphQLCV, GraphQLCVSummary } from '../api/graphql/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultCVData: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    linkedinUrl: '',
    portfolioUrl: '',
    summary: '',
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
};

const defaultCustomization: CustomizationOptions = {
  templateId: 'modern',
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
  fontSize: {
    heading: 24,
    body: 14,
  },
  spacing: {
    sectionGap: 24,
    elementGap: 12,
  },
  showPhoto: false,
  photoShape: 'circle',
  textDirection: 'ltr',
  fontStyle: 'normal',
};

const defaultQRConfig: QRCodeConfig = {
  enabled: false,
  url: '',
  size: 120,
  style: 'square',
};

interface CVStore {
  cvData: CVData;
  customization: CustomizationOptions;
  qrConfig: QRCodeConfig;
  currentCvId: string | null;
  cvList: GraphQLCVSummary[];
  isLoading: boolean;

  // Actions
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => Promise<void>;
  
  addExperience: (exp?: Partial<Experience>) => Promise<string>;
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  reorderExperiences: (fromIndex: number, toIndex: number) => void;
  
  addEducation: (edu?: Partial<Education>) => Promise<string>;
  updateEducation: (id: string, edu: Partial<Education>) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  reorderEducations: (fromIndex: number, toIndex: number) => void;
  
  addSkill: (skill?: Partial<Skill>) => Promise<string>;
  updateSkill: (id: string, skill: Partial<Skill>) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;
  reorderSkills: (fromIndex: number, toIndex: number) => void;
  
  addLanguage: (lang?: Partial<Language>) => Promise<string>;
  updateLanguage: (id: string, lang: Partial<Language>) => Promise<void>;
  removeLanguage: (id: string) => Promise<void>;
  
  addCertification: (cert?: Partial<Certification>) => Promise<string>;
  updateCertification: (id: string, cert: Partial<Certification>) => Promise<void>;
  removeCertification: (id: string) => Promise<void>;
  
  addProject: (proj?: Partial<Project>) => Promise<string>;
  updateProject: (id: string, proj: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  
  updateCustomization: (options: Partial<CustomizationOptions>) => Promise<void>;
  setTemplate: (templateId: TemplateId) => Promise<void>;
  
  updateQRConfig: (config: Partial<QRCodeConfig>) => Promise<void>;
  importLinkedInData: (source: string) => Promise<void>;
  loadSampleData: () => void;
  
  // Backend operations
  fetchCvList: () => Promise<void>;
  loadCV: (id: string) => Promise<void>;
  createNewCV: (title?: string) => Promise<string | null>;
  deleteCurrentCV: () => Promise<void>;
  resetCV: () => void;
}

// Convert GraphQL CV to local CVData
const convertGraphQLCVToLocal = (cv: GraphQLCV): { cvData: CVData; customization: CustomizationOptions; qrConfig: QRCodeConfig } => {
  const cvData: CVData = {
    personalInfo: {
      firstName: cv.personalInfo?.firstName || '',
      lastName: cv.personalInfo?.lastName || '',
      email: cv.personalInfo?.email || '',
      phone: cv.personalInfo?.phone || '',
      address: cv.personalInfo?.address || '',
      city: cv.personalInfo?.city || '',
      country: cv.personalInfo?.country || '',
      postalCode: cv.personalInfo?.postalCode || '',
      linkedinUrl: cv.personalInfo?.linkedinUrl || '',
      portfolioUrl: cv.personalInfo?.portfolioUrl || '',
      summary: cv.personalInfo?.summary || '',
      photo: cv.personalInfo?.photo || undefined,
    },
    experiences: (cv.experiences || []).map((e) => ({
      id: e.id,
      company: e.company || '',
      position: e.position || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      current: e.current || false,
      description: e.description || '',
      highlights: e.highlights || [],
    })),
    education: (cv.education || []).map((e) => ({
      id: e.id,
      institution: e.institution || '',
      degree: e.degree || '',
      field: e.field || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      gpa: e.gpa || undefined,
      description: e.description || undefined,
    })),
    skills: (cv.skills || []).map((s) => ({
      id: s.id,
      name: s.name || '',
      level: s.level || 50,
      category: s.category || 'Technical',
    })),
    languages: (cv.languages || []).map((l) => ({
      id: l.id,
      name: l.name || '',
      proficiency: l.proficiency as Language['proficiency'] || 'intermediate',
    })),
    certifications: (cv.certifications || []).map((c) => ({
      id: c.id,
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
      url: c.url || undefined,
    })),
    projects: (cv.projects || []).map((p) => ({
      id: p.id,
      name: p.name || '',
      description: p.description || '',
      url: p.url || undefined,
      technologies: p.technologies || [],
      highlights: p.highlights || [],
    })),
  };

  const customization: CustomizationOptions = {
    templateId: (cv.customization?.templateId || 'modern') as TemplateId,
    colors: {
      primary: cv.customization?.colors?.primary || '#2563eb',
      secondary: cv.customization?.colors?.secondary || '#1e40af',
      accent: cv.customization?.colors?.accent || '#3b82f6',
      text: cv.customization?.colors?.text || '#1f2937',
      background: cv.customization?.colors?.background || '#ffffff',
    },
    fonts: {
      heading: cv.customization?.fonts?.heading || 'Playfair Display',
      body: cv.customization?.fonts?.body || 'Source Sans Pro',
    },
    fontSize: {
      heading: cv.customization?.fontSize?.heading || 24,
      body: cv.customization?.fontSize?.body || 14,
    },
    spacing: {
      sectionGap: cv.customization?.spacing?.sectionGap || 24,
      elementGap: cv.customization?.spacing?.elementGap || 12,
    },
    showPhoto: cv.customization?.showPhoto || false,
    photoShape: (cv.customization?.photoShape as 'circle' | 'square' | 'rounded') || 'circle',
    textDirection: (cv.customization?.textDirection as 'ltr' | 'rtl') || 'ltr',
    fontStyle: (cv.customization?.fontStyle as 'normal' | 'bold' | 'light' | 'italic') || 'normal',
  };

  const qrConfig: QRCodeConfig = {
    enabled: cv.qrConfig?.enabled || false,
    url: cv.qrConfig?.url || '',
    size: cv.qrConfig?.size || 120,
    style: (cv.qrConfig?.style as 'square' | 'dots' | 'rounded') || 'square',
  };

  return { cvData, customization, qrConfig };
};

export const useCVStore = create<CVStore>()(
  (set, get) => ({
    cvData: { ...defaultCVData },
    customization: { ...defaultCustomization },
    qrConfig: { ...defaultQRConfig },
    currentCvId: null,
    cvList: [],
    isLoading: false,

    // ==================== CV List Operations ====================
    
    fetchCvList: async () => {
      set({ isLoading: true });
      try {
        const { data } = await apolloClient.query({
          query: GET_ALL_CVS_QUERY,
          fetchPolicy: 'network-only',
        });
        if (data?.allCvs) {
          set({ cvList: data.allCvs, isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    loadCV: async (id: string) => {
      set({ isLoading: true, currentCvId: id });
      try {
        const { data } = await apolloClient.query({
          query: GET_CV,
          variables: { id },
          fetchPolicy: 'network-only',
        });
        if (data?.cv) {
          const { cvData, customization, qrConfig } = convertGraphQLCVToLocal(data.cv);
          set({ cvData, customization, qrConfig, isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    createNewCV: async (title?: string) => {
      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_CV,
          variables: { title: title || 'Untitled CV' },
        });
        if (data?.createCv?.success && data.createCv.cv) {
          const newId = data.createCv.cv.id;
          set({ currentCvId: newId, cvData: { ...defaultCVData }, customization: { ...defaultCustomization }, qrConfig: { ...defaultQRConfig } });
          await get().fetchCvList();
          return newId;
        }
      } catch {
        // Handle error
      }
      return null;
    },

    deleteCurrentCV: async () => {
      const { currentCvId } = get();
      if (!currentCvId) return;
      try {
        await apolloClient.mutate({
          mutation: DELETE_CV,
          variables: { id: currentCvId },
        });
        set({ currentCvId: null, cvData: { ...defaultCVData }, customization: { ...defaultCustomization }, qrConfig: { ...defaultQRConfig } });
        await get().fetchCvList();
      } catch {
        // Handle error
      }
    },

    // ==================== Personal Info ====================
    
    updatePersonalInfo: async (info) => {
      const { currentCvId } = get();
      
      // Optimistic update
      set((state) => ({
        cvData: {
          ...state.cvData,
          personalInfo: { ...state.cvData.personalInfo, ...info },
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_PERSONAL_INFO,
            variables: { cvId: currentCvId, input: info },
          });
        } catch {
          // Revert on error - refetch
          await get().loadCV(currentCvId);
        }
      }
    },

    // ==================== Experience ====================
    
    addExperience: async (exp) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newExp: Experience = {
        id,
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: [],
        ...exp,
      };

      // Optimistic update
      set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: [...state.cvData.experiences, newExp],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_EXPERIENCE,
            variables: { cvId: currentCvId, input: newExp },
          });
          if (data?.createExperience?.experience?.id) {
            // Update with server-generated ID
            set((state) => ({
              cvData: {
                ...state.cvData,
                experiences: state.cvData.experiences.map((e) =>
                  e.id === id ? { ...e, id: data.createExperience.experience.id } : e
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateExperience: async (id, exp) => {
      const { currentCvId } = get();
      
      // Optimistic update
      set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: state.cvData.experiences.map((e) =>
            e.id === id ? { ...e, ...exp } : e
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_EXPERIENCE,
            variables: { id, input: exp },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeExperience: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: state.cvData.experiences.filter((e) => e.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_EXPERIENCE,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    reorderExperiences: (fromIndex, toIndex) => {
      set((state) => {
        const newExps = [...state.cvData.experiences];
        const [removed] = newExps.splice(fromIndex, 1);
        newExps.splice(toIndex, 0, removed);
        return { cvData: { ...state.cvData, experiences: newExps } };
      });
    },

    // ==================== Education ====================
    
    addEducation: async (edu) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newEdu: Education = {
        id,
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        ...edu,
      };

      set((state) => ({
        cvData: {
          ...state.cvData,
          education: [...state.cvData.education, newEdu],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_EDUCATION,
            variables: { cvId: currentCvId, input: newEdu },
          });
          if (data?.createEducation?.education?.id) {
            set((state) => ({
              cvData: {
                ...state.cvData,
                education: state.cvData.education.map((e) =>
                  e.id === id ? { ...e, id: data.createEducation.education.id } : e
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateEducation: async (id, edu) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          education: state.cvData.education.map((e) =>
            e.id === id ? { ...e, ...edu } : e
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_EDUCATION,
            variables: { id, input: edu },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeEducation: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          education: state.cvData.education.filter((e) => e.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_EDUCATION,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    reorderEducations: (fromIndex, toIndex) => {
      set((state) => {
        const newEdus = [...state.cvData.education];
        const [removed] = newEdus.splice(fromIndex, 1);
        newEdus.splice(toIndex, 0, removed);
        return { cvData: { ...state.cvData, education: newEdus } };
      });
    },

    // ==================== Skills ====================
    
    addSkill: async (skill) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newSkill: Skill = {
        id,
        name: '',
        level: 50,
        category: 'Technical',
        ...skill,
      };

      set((state) => ({
        cvData: {
          ...state.cvData,
          skills: [...state.cvData.skills, newSkill],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_SKILL,
            variables: { cvId: currentCvId, input: newSkill },
          });
          if (data?.createSkill?.skill?.id) {
            set((state) => ({
              cvData: {
                ...state.cvData,
                skills: state.cvData.skills.map((s) =>
                  s.id === id ? { ...s, id: data.createSkill.skill.id } : s
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateSkill: async (id, skill) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          skills: state.cvData.skills.map((s) =>
            s.id === id ? { ...s, ...skill } : s
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_SKILL,
            variables: { id, input: skill },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeSkill: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          skills: state.cvData.skills.filter((s) => s.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_SKILL,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    reorderSkills: (fromIndex, toIndex) => {
      set((state) => {
        const newSkills = [...state.cvData.skills];
        const [removed] = newSkills.splice(fromIndex, 1);
        newSkills.splice(toIndex, 0, removed);
        return { cvData: { ...state.cvData, skills: newSkills } };
      });
    },

    // ==================== Languages ====================
    
    addLanguage: async (lang) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newLang: Language = {
        id,
        name: '',
        proficiency: 'intermediate',
        ...lang,
      };

      set((state) => ({
        cvData: {
          ...state.cvData,
          languages: [...state.cvData.languages, newLang],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_LANGUAGE,
            variables: { cvId: currentCvId, input: newLang },
          });
          if (data?.createLanguage?.language?.id) {
            set((state) => ({
              cvData: {
                ...state.cvData,
                languages: state.cvData.languages.map((l) =>
                  l.id === id ? { ...l, id: data.createLanguage.language.id } : l
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateLanguage: async (id, lang) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          languages: state.cvData.languages.map((l) =>
            l.id === id ? { ...l, ...lang } : l
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_LANGUAGE,
            variables: { id, input: lang },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeLanguage: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          languages: state.cvData.languages.filter((l) => l.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_LANGUAGE,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    // ==================== Certifications ====================
    
    addCertification: async (cert) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newCert: Certification = {
        id,
        name: '',
        issuer: '',
        date: '',
        ...cert,
      };

      set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: [...state.cvData.certifications, newCert],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_CERTIFICATION,
            variables: { cvId: currentCvId, input: newCert },
          });
          if (data?.createCertification?.certification?.id) {
            set((state) => ({
              cvData: {
                ...state.cvData,
                certifications: state.cvData.certifications.map((c) =>
                  c.id === id ? { ...c, id: data.createCertification.certification.id } : c
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateCertification: async (id, cert) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: state.cvData.certifications.map((c) =>
            c.id === id ? { ...c, ...cert } : c
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_CERTIFICATION,
            variables: { id, input: cert },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeCertification: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: state.cvData.certifications.filter((c) => c.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_CERTIFICATION,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    // ==================== Projects ====================
    
    addProject: async (proj) => {
      const id = generateId();
      const { currentCvId } = get();
      
      const newProj: Project = {
        id,
        name: '',
        description: '',
        technologies: [],
        highlights: [],
        ...proj,
      };

      set((state) => ({
        cvData: {
          ...state.cvData,
          projects: [...state.cvData.projects, newProj],
        },
      }));

      if (currentCvId) {
        try {
          const { data } = await apolloClient.mutate({
            mutation: CREATE_PROJECT,
            variables: { cvId: currentCvId, input: newProj },
          });
          if (data?.createProject?.project?.id) {
            set((state) => ({
              cvData: {
                ...state.cvData,
                projects: state.cvData.projects.map((p) =>
                  p.id === id ? { ...p, id: data.createProject.project.id } : p
                ),
              },
            }));
          }
        } catch {
          await get().loadCV(currentCvId);
        }
      }
      
      return id;
    },

    updateProject: async (id, proj) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          projects: state.cvData.projects.map((p) =>
            p.id === id ? { ...p, ...proj } : p
          ),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_PROJECT,
            variables: { id, input: proj },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    removeProject: async (id) => {
      const { currentCvId } = get();
      
      set((state) => ({
        cvData: {
          ...state.cvData,
          projects: state.cvData.projects.filter((p) => p.id !== id),
        },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: DELETE_PROJECT,
            variables: { id },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    // ==================== Customization ====================
    
    updateCustomization: async (options) => {
      const { currentCvId } = get();
      
      // Optimistic update
      set((state) => ({
        customization: { ...state.customization, ...options },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_CUSTOMIZATION,
            variables: { cvId: currentCvId, input: options },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    setTemplate: async (templateId) => {
      await get().updateCustomization({ templateId });
    },

    updateQRConfig: async (config) => {
      const { currentCvId } = get();
      
      set((state) => ({
        qrConfig: { ...state.qrConfig, ...config },
      }));

      if (currentCvId) {
        try {
          await apolloClient.mutate({
            mutation: UPDATE_QR_CONFIG,
            variables: { cvId: currentCvId, input: config },
          });
        } catch {
          await get().loadCV(currentCvId);
        }
      }
    },

    importLinkedInData: async (source: string) => {
      void source;
      // Placeholder: simulate import by loading sample data
      // In a real app, this would parse `source` and map fields
      await new Promise((res) => setTimeout(res, 800));
      get().loadSampleData();
    },

    loadSampleData: () => {
      const sample: CVData = {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '+1 555-1234',
          address: '123 Example St',
          city: 'Anytown',
          country: 'USA',
          postalCode: '12345',
          linkedinUrl: 'https://www.linkedin.com/in/janedoe',
          portfolioUrl: 'https://janedoe.dev',
          summary: 'Experienced software engineer with a passion for building impactful applications.'
        },
        experiences: [
          {
            id: generateId(),
            company: 'Acme Corp',
            position: 'Senior Engineer',
            location: 'Remote',
            startDate: '2019-01-01',
            endDate: '',
            current: true,
            description: 'Working on frontend infrastructure and developer tools.',
            highlights: ['Led migration to modern stack', 'Improved build times by 40%']
          }
        ],
        education: [
          {
            id: generateId(),
            institution: 'State University',
            degree: 'BSc Computer Science',
            field: 'Computer Science',
            startDate: '2012-09-01',
            endDate: '2016-06-01'
          }
        ],
        skills: [
          { id: generateId(), name: 'React', level: 80, category: 'Technical' },
          { id: generateId(), name: 'TypeScript', level: 75, category: 'Technical' }
        ],
        languages: [
          { id: generateId(), name: 'English', proficiency: 'native' }
        ],
        certifications: [
          { id: generateId(), name: 'Certified Example', issuer: 'Example Org', date: '2021-05-01' }
        ],
        projects: [
          { id: generateId(), name: 'CV Builder', description: 'A modern CV building tool', technologies: ['React', 'TypeScript'], highlights: [] }
        ],
      };

      set({ cvData: sample, customization: { ...defaultCustomization }, qrConfig: { ...defaultQRConfig } });
    },

    // ==================== Reset ====================
    
    resetCV: () => {
      set({
        cvData: { ...defaultCVData },
        customization: { ...defaultCustomization },
        qrConfig: { ...defaultQRConfig },
      });
    },
  })
);
