import { gql } from '@apollo/client';

// ==================== AUTH QUERIES ====================

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    viewer {
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
`;

// ==================== CV QUERIES ====================

export const GET_ALL_CVS = gql`
  query GetAllCvs {
    allCvs {
      id
      title
      status
      templateId
      lastModified
      createdAt
    }
  }
`;

export const GET_CV = gql`
  query GetCv($id: ID!) {
    cv(id: $id) {
      id
      title
      status
      templateId
      lastModified
      personalInfo {
        firstName
        lastName
        email
        phone
        address
        city
        country
        postalCode
        linkedinUrl
        portfolioUrl
        summary
        photo
      }
      experiences {
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
      skills {
        id
        name
        level
        category
      }
      languages {
        id
        name
        proficiency
      }
      certifications {
        id
        name
        issuer
        date
        url
      }
      projects {
        id
        name
        description
        url
        technologies
        highlights
      }
      customization {
        templateId
        colors {
          primary
          secondary
          accent
          text
          background
        }
        fonts {
          heading
          body
        }
        fontSize {
          heading
          body
        }
        spacing {
          sectionGap
          elementGap
        }
        showPhoto
        photoShape
        textDirection
        fontStyle
      }
      qrConfig {
        enabled
        url
        size
        style
      }
    }
  }
`;

// ==================== ADMIN QUERIES ====================

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      email
      firstName
      lastName
      role
      avatar
      createdAt
      lastLogin
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalCVs
      activeToday
      publishedCvs
      userGrowthData {
        month
        users
        cvs
      }
      templateUsageData {
        name
        value
        color
      }
      dailyActivityData {
        day
        logins
        cvsCreated
      }
      recentActivity {
        id
        user
        action
        detail
        time
        type
      }
    }
  }
`;
