import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { removeProfilePhoto, uploadProfilePhoto } from '../../api/profilePhotos';

const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export const PersonalInfoEditor: React.FC = () => {
  const {
    cvData,
    currentCvId,
    updatePersonalInfo,
    setProfilePhoto,
    customization,
    updateCustomization,
  } = useCVStore();
  const { personalInfo } = cvData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handlePhotoUpload = async (file: File) => {
    setPhotoError('');
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setPhotoError('Choose a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setPhotoError('Image size must be 5 MB or smaller.');
      return;
    }
    if (!currentCvId) {
      setPhotoError('Save this CV before uploading a profile photo.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const photo = await uploadProfilePhoto(currentCvId, file);
      setProfilePhoto(photo);
      updateCustomization({ showPhoto: true });
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : 'Profile photo upload failed.',
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handlePhotoUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handlePhotoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removePhoto = async () => {
    setPhotoError('');
    if (!currentCvId) {
      setPhotoError('Save this CV before removing its profile photo.');
      return;
    }
    setUploadingPhoto(true);
    try {
      await removeProfilePhoto(currentCvId);
      setProfilePhoto(undefined);
      updateCustomization({ showPhoto: false });
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : 'Profile photo could not be removed.',
      );
    } finally {
      setUploadingPhoto(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getShapeClass = () => {
    switch (customization.photoShape) {
      case 'circle': return 'rounded-full';
      case 'rounded': return 'rounded-xl';
      case 'square': return 'rounded-none';
      default: return 'rounded-full';
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Upload Section */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Profile Photo
          </span>
        </label>

        {/* Upload Area / Preview */}
        {personalInfo.photo ? (
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 overflow-hidden border-2 border-gray-200 shadow-sm ${getShapeClass()}`}>
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Photo uploaded</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading…' : 'Change'}
                </button>
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => void removePhoto()}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {uploadingPhoto
                ? 'Uploading photo…'
                : dragOver
                  ? 'Drop your image here'
                  : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP • Max 5 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploadingPhoto}
          onChange={handleFileChange}
          className="hidden"
        />
        {photoError && (
          <p role="alert" className="mt-2 text-sm text-red-600">{photoError}</p>
        )}

        {/* Frame Shape Selector */}
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1.5">Frame Shape</label>
          <div className="flex gap-2">
            {[
              { value: 'circle', label: 'Circle', icon: (
                <div className="w-6 h-6 rounded-full border-2 border-current" />
              )},
              { value: 'rounded', label: 'Rounded', icon: (
                <div className="w-6 h-6 rounded-lg border-2 border-current" />
              )},
              { value: 'square', label: 'Square', icon: (
                <div className="w-6 h-6 rounded-none border-2 border-current" />
              )},
            ].map((shape) => (
              <button
                key={shape.value}
                onClick={() => updateCustomization({ photoShape: shape.value as typeof customization.photoShape })}
                className={`flex-1 py-2 px-3 flex flex-col items-center gap-1 text-xs font-medium border rounded-lg transition-all ${
                  customization.photoShape === shape.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {shape.icon}
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            value={personalInfo.lastName}
            onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={personalInfo.email}
          onChange={(e) => updatePersonalInfo({ email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="john.doe@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={personalInfo.phone}
          onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="+1 (555) 123-4567"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={personalInfo.city}
            onChange={(e) => updatePersonalInfo({ city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="San Francisco"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={personalInfo.country}
            onChange={(e) => updatePersonalInfo({ country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="USA"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={personalInfo.address}
          onChange={(e) => updatePersonalInfo({ address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="123 Main Street"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
        <input
          type="url"
          value={personalInfo.linkedinUrl}
          onChange={(e) => updatePersonalInfo({ linkedinUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
        <input
          type="url"
          value={personalInfo.portfolioUrl}
          onChange={(e) => updatePersonalInfo({ portfolioUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="https://yourportfolio.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary *</label>
        <textarea
          value={personalInfo.summary}
          onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Write a brief professional summary highlighting your key qualifications and career objectives..."
        />
        <p className="text-xs text-gray-500 mt-1">{personalInfo.summary.length}/500 characters</p>
      </div>
    </div>
  );
};
