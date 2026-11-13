interface ProfilePhotoResponse {
  photo: string;
}

function isProfilePhotoResponse(value: unknown): value is ProfilePhotoResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'photo' in value &&
    typeof value.photo === 'string'
  );
}

async function readProfilePhotoResponse(response: Response): Promise<string> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The server returned an invalid response for the profile photo.');
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Profile photo upload failed.';
    throw new Error(message);
  }
  if (!isProfilePhotoResponse(payload)) {
    throw new Error('The server returned an invalid profile photo response.');
  }
  return payload.photo;
}

function authorizationHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Sign in before uploading a profile photo.');
  return { Authorization: `JWT ${token}` };
}

const MAX_PHOTO_DIMENSION = 800;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be read. Choose a JPG, PNG or WebP photo.'));
    };
    img.src = url;
  });
}

/**
 * Resize and convert any image the browser can open (including phone HEIC photos)
 * into a small JPEG, so uploads stay well under server size limits.
 */
export async function prepareProfilePhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot process images.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.88),
  );
  if (!blob) throw new Error('This image could not be converted.');
  const baseName = (file.name.replace(/\.[^.]*$/, '') || 'photo')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .slice(0, 60);
  return new File([blob], `${baseName || 'photo'}.jpg`, { type: 'image/jpeg' });
}

export async function uploadProfilePhoto(cvId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('photo', await prepareProfilePhoto(file));
  const response = await fetch(`/api/cvs/${encodeURIComponent(cvId)}/profile-photo/`, {
    method: 'POST',
    headers: authorizationHeaders(),
    body: formData,
  });
  return readProfilePhotoResponse(response);
}

export async function removeProfilePhoto(cvId: string): Promise<void> {
  const response = await fetch(
    `/api/cvs/${encodeURIComponent(cvId)}/profile-photo/remove/`,
    {
      method: 'POST',
      headers: authorizationHeaders(),
    },
  );
  await readProfilePhotoResponse(response);
}
