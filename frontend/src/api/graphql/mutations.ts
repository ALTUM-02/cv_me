import { gql } from '@apollo/client';

// ==================== AUTH MUTATIONS ====================

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      success
      message
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const TOKEN_AUTH = gql`
  mutation TokenAuth($email: String!, $password: String!) {
    tokenAuth(email: $email, password: $password) {
      token
      payload
      refreshExpiresIn
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      payload
    }
  }
`;

// ==================== CV MUTATIONS ====================

export const CREATE_CV = gql`
  mutation CreateCv($title: String!, $templateId: String) {
    createCv(title: $title, templateId: $templateId) {
      success
      message
      cv {
        id
        title
        status
        templateId
        lastModified
        createdAt
      }
    }
  }
`;

export const UPDATE_CV = gql`
  mutation UpdateCv($id: ID!, $title: String, $status: String, $templateId: String) {
    updateCv(id: $id, title: $title, status: $status, templateId: $templateId) {
      success
      message
      cv {
        id
        title
        status
        templateId
        lastModified
      }
    }
  }
`;

export const DELETE_CV = gql`
  mutation DeleteCv($id: ID!) {
    deleteCv(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_PERSONAL_INFO = gql`
  mutation UpdatePersonalInfo($cvId: ID!, $input: PersonalInfoInput!) {
    updatePersonalInfo(cvId: $cvId, input: $input) {
      success
      message
    }
  }
`;



export const UPDATE_CUSTOMIZATION = gql`
  mutation UpdateCustomization(
    $cvId: ID!
    $input: CustomizationInput
  ) {
    updateCustomization(
      cvId: $cvId
      input: $input
    ) {
      success
      message
    }
  }
`;

export const UPDATE_QR_CONFIG = gql`
  mutation UpdateQrConfig(
    $cvId: ID!
    $enabled: Boolean
    $style: String
    $foreground: String
    $background: String
    $size: Int
    $url: String
  ) {
    updateQrConfig(
      cvId: $cvId
      enabled: $enabled
      style: $style
      foreground: $foreground
      background: $background
      size: $size
      url: $url
    ) {
      success
      message
    }
  }
`;


// Use this for CREATE
// Keep your existing one...
export const CREATE_EXPERIENCE = gql`
  mutation CreateExperience($cvId: ID!, $input: ExperienceInput!) {
    createExperience(cvId: $cvId, input: $input) {
      success
      experience {
        id
        company
        position
      }
    }
  }
`;

export const UPDATE_EXPERIENCE = gql`
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
      success
      experience {
        id
        company
        position
      }
    }
  }
`;




export const DELETE_EXPERIENCE = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
    }
  }
`;

export const CREATE_EDUCATION = gql`
  mutation CreateEducation($cvId: ID!, $input: EducationInput!) {
    createEducation(cvId: $cvId, input: $input) {
      success
      education {
        id
        institution
        degree
        field
        startDate
        endDate
        gpa
        description
      }
    }
  }
`;

export const UPDATE_EDUCATION = gql`
  mutation UpdateEducation(
    $id: ID!
    $input: EducationInput!
  ) {
    updateEducation(
      id: $id
      input: $input
    ) {
      success
      education {
        id
      }
    }
  }
`;

export const DELETE_EDUCATION = gql`
  mutation DeleteEducation($id: ID!) {
    deleteEducation(id: $id) {
      success
    }
  }
`;

export const CREATE_SKILL = gql`
  mutation CreateSkill($cvId: ID!, $input: SkillInput!) {
    createSkill(cvId: $cvId, input: $input) {
      success
      skill {
        id
        name
        level
        category
      }
    }
  }
`;

export const UPDATE_SKILL = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
      success
      skill {
        id
      }
    }
  }
`;

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success
    }
  }
`;

export const CREATE_LANGUAGE = gql`
  mutation CreateLanguage($cvId: ID!, $input: LanguageInput!) {
    createLanguage(cvId: $cvId, input: $input) {
      success
      language {
        id
        name
        proficiency
      }
    }
  }
`;

export const UPDATE_LANGUAGE = gql`
  mutation UpdateLanguage($id: ID!, $input: LanguageInput!) {
    updateLanguage(id: $id, input: $input) {
      success
      language {
        id
      }
    }
  }
`;

export const DELETE_LANGUAGE = gql`
  mutation DeleteLanguage($id: ID!) {
    deleteLanguage(id: $id) {
      success
    }
  }
`;

export const CREATE_CERTIFICATION = gql`
  mutation CreateCertification($cvId: ID!) {
    createCertification(cvId: $cvId) {
      success
      message
      certification {
        id
        name
        issuer
        date
        url
      }
    }
  }
`;

export const UPDATE_CERTIFICATION = gql`
  mutation UpdateCertification(
    $id: ID!
    $name: String
    $issuer: String
    $date: String
    $url: String
    $order: Int
  ) {
    updateCertification(
      id: $id
      name: $name
      issuer: $issuer
      date: $date
      url: $url
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_CERTIFICATION = gql`
  mutation DeleteCertification($id: ID!) {
    deleteCertification(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($cvId: ID!, $input: ProjectInput!) {
    createProject(cvId: $cvId, input: $input) {
      success
      project {
        id
        name
        description
        url
        technologies
        highlights
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      success
      project {
        id
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
    }
  }
`;

// ==================== ADMIN MUTATIONS ====================

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      success
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;
