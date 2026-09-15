import { useRef, useState, type ChangeEvent } from 'react';
import { ApiError, uploadImages } from '../lib/api';
import { CloseIcon, SpinnerIcon, UploadIcon } from './Icons';
import { Alert } from './ui';

interface Props {
  label: string;
  hint?: string;
  /** Jedna slika (naslovna) ili više njih (galerija). */
  multiple?: boolean;
  value: string[];
  onChange: (urls: string[]) => void;
}

/**
 * Učitavanje slika povlačenjem ili odabirom datoteke, uz mogućnost
 * ručnog unosa URL-a (korisno za vanjske izvore).
 */
export default function ImageUploader({ label, hint, multiple = false, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const urls = await uploadImages(multiple ? files : files.slice(0, 1));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Učitavanje nije uspjelo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleFiles(Array.from(event.target.files ?? []));

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange(multiple ? [...value, url] : [url]);
    setUrlInput('');
  };

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <p className="label">{label}</p>

      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative">
              <div className="h-24 w-20 overflow-hidden rounded-lg border border-line bg-canvas">
                <img
                  src={url}
                  alt={`Slika ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.15';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -top-2 -right-2 rounded-full bg-ink p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Ukloni sliku ${i + 1}`}
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')));
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? 'border-brand bg-brand-soft' : 'border-line bg-canvas'
        }`}
      >
        {uploading ? (
          <>
            <SpinnerIcon className="h-5 w-5 text-brand" />
            <p className="text-xs text-ink-soft">Učitavanje…</p>
          </>
        ) : (
          <>
            <UploadIcon className="h-5 w-5 text-muted" />
            <p className="text-xs text-ink-soft">
              Povucite {multiple ? 'slike' : 'sliku'} ovdje ili{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-brand underline underline-offset-2"
              >
                odaberite datoteku
              </button>
            </p>
            {hint && <p className="text-[11px] text-muted">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…ili zalijepite URL slike"
          className="input text-xs"
        />
        <button type="button" onClick={addUrl} className="btn-secondary px-3 text-xs">
          Dodaj
        </button>
      </div>

      {error && (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}
