import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImages, type AnalyzeResponse } from '../services/api';

interface UploadProps {
  onResults: (results: AnalyzeResponse) => void;
}

const Upload: React.FC<UploadProps> = ({ onResults }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/bmp': ['.bmp']
    },
    maxFiles: 3,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => {
        const errorMessages = rejection.errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `File ${rejection.file.name} is too large (max 10MB)`;
            case 'file-invalid-type':
              return `File ${rejection.file.name} is not a valid image type (jpg, png, bmp)`;
            case 'too-many-files':
              return 'Maximum 3 files allowed';
            default:
              return `File ${rejection.file.name}: ${error.message}`;
          }
        });
        return errorMessages.join(', ');
      });
      setError(errors.join('; '));
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await analyzeImages(files);
      onResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze images');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isDragActive ? (
            <p>Drop the images here...</p>
          ) : (
            <div>
              <p>Drag & drop up to 3 ingredient images here, or click to select</p>
              <p className="dropzone-hint">
                Supported formats: JPG, PNG, BMP (max 10MB each)
              </p>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Selected Images ({files.length}/3)</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="remove-file"
                disabled={isLoading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="analyze-button"
        >
          {isLoading ? 'Analyzing Images...' : 'Analyze Ingredients'}
        </button>
      )}
    </div>
  );
};

export default Upload;

