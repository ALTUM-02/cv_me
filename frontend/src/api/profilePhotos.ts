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

export async function uploadProfilePhoto(cvId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('photo', file);
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
