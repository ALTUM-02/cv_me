import type { Certification } from '../types';

interface UploadedCertificationResponse {
  certifications: Certification[];
}

function isCertification(value: unknown): value is Certification {
  if (typeof value !== 'object' || value === null) return false;
  const certification = value as Record<string, unknown>;
  return (
    typeof certification.id === 'string' &&
    typeof certification.name === 'string' &&
    typeof certification.issuer === 'string' &&
    typeof certification.date === 'string' &&
    typeof certification.documentUrl === 'string' &&
    typeof certification.documentName === 'string'
  );
}

export async function uploadCertificationFiles(
  files: File[],
  options: { cvId?: string; certificationId?: string },
): Promise<Certification[]> {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Sign in before uploading certificate files.');
  if (!options.cvId && !options.certificationId) {
    throw new Error('Save this CV before uploading certificate files.');
  }

  const formData = new FormData();
  if (options.cvId) formData.append('cv_id', options.cvId);
  if (options.certificationId) {
    formData.append('certification_id', options.certificationId);
  }
  files.forEach((file) => formData.append('files', file));

  const response = await fetch('/api/certifications/upload/', {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Certificate upload failed.';
    throw new Error(message);
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('certifications' in payload) ||
    !Array.isArray(payload.certifications) ||
    !payload.certifications.every(isCertification)
  ) {
    throw new Error('The server returned an invalid certificate upload response.');
  }
  return (payload as UploadedCertificationResponse).certifications;
}

export async function downloadCertificationDocument(url: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Sign in before downloading certificate files.');

  const response = await fetch(url, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!response.ok) throw new Error('The certificate file could not be downloaded.');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = 'certificate';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
