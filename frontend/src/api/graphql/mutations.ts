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

// ==================== OTP MUTATIONS ====================

export const SEND_OTP = gql`
  mutation SendOtp($email: String!, $code: String!) {
    sendOtp(email: $email, code: $code) {
      success
      message
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($email: String!, $code: String!) {
    verifyOtp(email: $email, code: $code) {
      success
      message
      token
      user {
        id
        email
        firstName
        lastName
        role
        avatar
        dateJoined
        lastLogin
      }
    }
  }
`;

export const REGISTER_WITH_OTP = gql`
  mutation RegisterWithOtp(
    $email: String!
    $code: String!
    $firstName: String!
    $lastName: String!
    $password: String!
  ) {
    registerWithOtp(
      email: $email
      code: $code
      firstName: $firstName
      lastName: $lastName
      password: $password
    ) {
      success
      message
      token
      user {
        id
        email
        firstName
        lastName
        role
        avatar
        dateJoined
        lastLogin
      }
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

export const CREATE_EXPERIENCE = gql`
  mutation CreateExperience($cvId: ID!) {
    createExperience(cvId: $cvId) {
      success
      message
      experience {
        id
        company
        position
        location
        startDate
        endDate
        current
        description
        highlights
      }
    }
  }
`;

export const UPDATE_EXPERIENCE = gql`
  mutation UpdateExperience(
    $id: ID!
    $company: String
    $position: String
    $location: String
    $startDate: String
    $endDate: String
    $current: Boolean
    $description: String
    $highlights: [String]
    $order: Int
  ) {
    updateExperience(
      id: $id
      company: $company
      position: $position
      location: $location
      startDate: $startDate
      endDate: $endDate
      current: $current
      description: $description
      highlights: $highlights
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_EXPERIENCE = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_EDUCATION = gql`
  mutation CreateEducation($cvId: ID!) {
    createEducation(cvId: $cvId) {
      success
      message
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
    $institution: String
    $degree: String
    $field: String
    $startDate: String
    $endDate: String
    $gpa: String
    $description: String
    $order: Int
  ) {
    updateEducation(
      id: $id
      institution: $institution
      degree: $degree
      field: $field
      startDate: $startDate
      endDate: $endDate
      gpa: $gpa
      description: $description
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_EDUCATION = gql`
  mutation DeleteEducation($id: ID!) {
    deleteEducation(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_SKILL = gql`
  mutation CreateSkill($cvId: ID!) {
    createSkill(cvId: $cvId) {
      success
      message
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
  mutation UpdateSkill(
    $id: ID!
    $name: String
    $level: String
    $category: String
    $order: Int
  ) {
    updateSkill(
      id: $id
      name: $name
      level: $level
      category: $category
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_LANGUAGE = gql`
  mutation CreateLanguage($cvId: ID!) {
    createLanguage(cvId: $cvId) {
      success
      message
      language {
        id
        name
        proficiency
      }
    }
  }
`;

export const UPDATE_LANGUAGE = gql`
  mutation UpdateLanguage(
    $id: ID!
    $name: String
    $proficiency: String
    $order: Int
  ) {
    updateLanguage(
      id: $id
      name: $name
      proficiency: $proficiency
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_LANGUAGE = gql`
  mutation DeleteLanguage($id: ID!) {
    deleteLanguage(id: $id) {
      success
      message
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
  mutation CreateProject($cvId: ID!) {
    createProject(cvId: $cvId) {
      success
      message
      project {
        id
        name
        description
        url
        technologies
        startDate
        endDate
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $name: String
    $description: String
    $url: String
    $technologies: [String]
    $startDate: String
    $endDate: String
    $order: Int
  ) {
    updateProject(
      id: $id
      name: $name
      description: $description
      url: $url
      technologies: $technologies
      startDate: $startDate
      endDate: $endDate
      order: $order
    ) {
      success
      message
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      message
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
