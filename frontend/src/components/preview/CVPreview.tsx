import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { CVData, CustomizationOptions, QRCodeConfig } from '../../types';
import { formatDate } from '../../utils/helpers';

interface CVPreviewProps {
  cvData: CVData;
  customization: CustomizationOptions;
  qrConfig: QRCodeConfig;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ 
  cvData, 
  customization, 
  qrConfig 
}) => {
  const { personalInfo, experiences, education, skills, languages, certifications, projects } = cvData;
  
  const hasContent = personalInfo.firstName || personalInfo.lastName || 
    experiences.length > 0 || education.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 min-h-800px">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Building Your CV</h3>
          <p className="text-gray-500 max-w-sm">
            Fill in your details on the left panel and watch your professional CV come to life here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="cv-preview"
      className="w-full bg-white shadow-2xl"
      dir={customization.textDirection || 'ltr'}
      style={{
        fontFamily: `"${customization.fonts.body}", sans-serif`,
        color: customization.colors.text,
        minHeight: '1100px',
        fontWeight: customization.fontStyle === 'bold' ? 700 : customization.fontStyle === 'light' ? 300 : undefined,
        fontStyle: customization.fontStyle === 'italic' ? 'italic' : undefined,
      }}
    >
      {/* Header Section */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${customization.colors.primary}, ${customization.colors.secondary})`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white"></div>
          <div className="absolute top-12 right-12 w-24 h-24 rounded-full border-4 border-white"></div>
        </div>
        
        <div className="relative p-8 flex items-center gap-6">
          {/* Photo */}
          {customization.showPhoto && personalInfo.photo ? (
            <div 
              className={`w-28 h-28 shrink-0 overflow-hidden border-4 border-white shadow-lg ${
                customization.photoShape === 'circle' ? 'rounded-full' :
                customization.photoShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
              }`}
            >
              <img 
                src={personalInfo.photo} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div 
              className={`w-28 h-28 shrink-0 bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white border-2 border-white/30 ${
                customization.photoShape === 'circle' ? 'rounded-full' :
                customization.photoShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
              }`}
              style={{ fontFamily: `"${customization.fonts.heading}", serif` }}
            >
              {personalInfo.firstName?.charAt(0) || ''}{personalInfo.lastName?.charAt(0) || ''}
            </div>
          )}
          
          <div className="flex-1 text-white">
            <h1 
              className="text-4xl font-bold mb-2 tracking-tight"
              style={{ fontFamily: `"${customization.fonts.heading}", serif` }}
            >
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/90 mt-3">
              {personalInfo.email && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {personalInfo.phone}
                </span>
              )}
              {(personalInfo.city || personalInfo.country) && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            
            <div className="flex gap-3 mt-3">
              {personalInfo.linkedinUrl && (
                <a href={personalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-white/80 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {personalInfo.portfolioUrl && (
                <a href={personalInfo.portfolioUrl} target="_blank" rel="noopener noreferrer"
                   className="text-white/80 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          {/* QR Code */}
          {qrConfig.enabled && qrConfig.url && (
            <div className="shrink-0 bg-white p-2 rounded-lg shadow-lg">
              <QRCodeSVG 
                value={qrConfig.url}
                size={qrConfig.size}
                bgColor="#ffffff"
                fgColor={customization.colors.primary}
                level="M"
                includeMargin={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <h2 
                className="text-xl font-bold mb-3 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 
                className="text-xl font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Work Experience
              </h2>
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-gray-200">
                    <div 
                      className="absolute left-5px top-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: customization.colors.accent }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-base" style={{ color: customization.colors.text }}>
                          {exp.position}
                        </h3>
                        <p className="text-sm font-medium" style={{ color: customization.colors.secondary }}>
                          {exp.company} {exp.location ? `• ${exp.location}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    )}
                    {exp.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.highlights.map((highlight, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span style={{ color: customization.colors.accent }} className="mt-1">▸</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 
                className="text-xl font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Projects
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold" style={{ color: customization.colors.text }}>
                        {project.name}
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer"
                             className="text-xs ml-2 font-normal hover:underline" style={{ color: customization.colors.accent }}>
                            View Project ↗
                          </a>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${customization.colors.accent}20`,
                              color: customization.colors.primary,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 
                className="text-lg font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Skills
              </h2>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${skill.level}%`,
                          background: `linear-gradient(90deg, ${customization.colors.primary}, ${customization.colors.accent})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 
                className="text-lg font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="relative pl-4 border-l-2 border-gray-200">
                    <div 
                      className="absolute left-5px top-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: customization.colors.accent }}
                    />
                    <h3 className="font-bold text-sm" style={{ color: customization.colors.text }}>
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-sm" style={{ color: customization.colors.secondary }}>
                      {edu.institution}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h2 
                className="text-lg font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{lang.name}</span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ 
                        backgroundColor: `${customization.colors.accent}20`,
                        color: customization.colors.primary,
                      }}
                    >
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <h2 
                className="text-lg font-bold mb-4 pb-2 border-b-2"
                style={{ 
                  color: customization.colors.primary,
                  borderColor: customization.colors.accent,
                  fontFamily: `"${customization.fonts.heading}", serif`,
                }}
              >
                Certifications
              </h2>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-sm">
                    <p className="font-medium" style={{ color: customization.colors.text }}>
                      {cert.name}
                    </p>
                    <p className="text-gray-500 text-xs">{cert.issuer} • {formatDate(cert.date)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
