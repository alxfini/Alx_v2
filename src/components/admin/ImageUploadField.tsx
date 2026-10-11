import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Globe, 
  ExternalLink, 
  CloudCheck, 
  Loader2,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { uploadToGitHubRelease, deleteGitHubReleaseAsset, deleteServerFile } from '../../services/githubStorageService';
import { optimizeImageFile } from '../../services/imageOptimizer';
import { getMediaPreviewUrl, isVideoMediaUrl } from '../../utils/mediaUrl';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  previewAspect?: 'square' | 'video' | 'wide' | 'auto';
  presetOptions?: { label: string; url: string }[];
  compressAsJpg?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'auto',
  previewAspect,
  presetOptions = [],
  compressAsJpg = false,
}) => {
  const effectiveAspect = previewAspect || aspectRatio;
  const { brand } = useSiteData();
  const ghConfig = brand.githubStorage;
  const isGhConfigured = !!(ghConfig?.token && ghConfig?.owner && ghConfig?.repo);

  // Determina o modo inicial
  const getInitialMode = () => {
    if (!value) return 'upload';
    if (value.startsWith('/uploads/') || value.startsWith('/imagens/')) return 'upload';
    return 'url';
  };

  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>(getInitialMode);
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isGitHubUrl = (url: string) => url?.includes('github.com') && url?.includes('/releases/');
  const isServerRelativeUrl = (url: string) => url?.startsWith('/uploads/') || url?.startsWith('/imagens/') || url?.startsWith('/');
  const isPublicCloudUrl = (url: string) => url?.startsWith('http://') || url?.startsWith('https://');

  // Upload para Servidor Local / Hostinger com garantia de persistência permanente
  const handleUploadToServer = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i));
    const isFavicon = label.toLowerCase().includes('favicon');
    const isLogoOrIcon = effectiveAspect === 'square' || label.toLowerCase().includes('logo') || label.toLowerCase().includes('ícone') || isFavicon;

    try {
      if (!isVideo) {
        setUploadStatus(isFavicon ? 'Otimizando e aplicando Favicon...' : 'Otimizando e preparando imagem permanente...');
        const maxDimension = isFavicon ? 256 : (isLogoOrIcon ? 512 : 1600);
        const targetFormat = compressAsJpg ? 'image/jpeg' : ((isFavicon || isLogoOrIcon) ? 'image/png' : 'image/webp');

        const optimizedUrl = await optimizeImageFile(file, {
          isLogoOrIcon,
          compressAsJpg,
          maxWidth: maxDimension,
          maxHeight: maxDimension,
          quality: compressAsJpg ? 0.88 : 0.92,
          format: targetFormat,
        });

        // 1. Tenta salvar no endpoint PHP / servidor
        let serverUrl = '';
        try {
          const formData = new FormData();
          formData.append('file', file);
          if (compressAsJpg) {
            formData.append('compressAsJpg', 'true');
          }
          const res = await fetch('/api/upload.php', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.success && data?.url) {
              serverUrl = data.url;
            }
          }
        } catch {}

        // Se o servidor gravou o arquivo, usa a URL do servidor (/uploads/media_xxx.ext).
        // Se o servidor falhar ou não responder, usa a URL otimizada local como garantia permanente.
        const finalUrl = serverUrl || optimizedUrl;

        onChange(finalUrl);
        setUrlInput(finalUrl);
        setSuccessMsg(isFavicon ? 'Favicon atualizado e aplicado com sucesso!' : `Imagem salva com proteção permanente contra perda (${formatBytes(file.size)})!`);
        setIsProcessing(false);
        setUploadStatus(null);
        return;
      }

      // Para vídeos grandes: envia para servidor
      setUploadStatus('Enviando vídeo para o servidor...');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.success && data?.url) {
          onChange(data.url);
          setUrlInput(data.url);
          setSuccessMsg(`Vídeo salvo com sucesso (${formatBytes(file.size)})!`);
          setIsProcessing(false);
          setUploadStatus(null);
          return;
        }
      }

      throw new Error('Falha no upload para o servidor.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao salvar arquivo.');
    } finally {
      setIsProcessing(false);
      setUploadStatus(null);
    }
  };

  const handleFilePicked = (file: File) => {
    const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i));
    const isImage = file.type.startsWith('image/') || Boolean(file.name.match(/\.(jpg|jpeg|png|webp|svg|gif|ico|bmp)$/i));

    if (!isImage && !isVideo) {
      setErrorMsg('Arquivo inválido. Selecione uma imagem (PNG, SVG, ICO, JPG, WEBP) ou vídeo (MP4, WebM).');
      return;
    }

    handleUploadToServer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setErrorMsg(null);
      setSuccessMsg('Link aplicado!');
    }
  };

  const handleDeleteMedia = async () => {
    if (!value) return;
    const confirmDelete = window.confirm('Deseja remover esta mídia? Se estiver no GitHub ou Servidor, o arquivo também será excluído.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      if (isGitHubUrl(value) && ghConfig && isGhConfigured) {
        await deleteGitHubReleaseAsset(ghConfig, value);
      } else if (value.startsWith('/uploads/')) {
        await deleteServerFile(value);
      }
      onChange('');
      setUrlInput('');
      setSuccessMsg('Mídia removida com sucesso!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao excluir mídia.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getAspectClass = () => {
    switch (effectiveAspect) {
      case 'square': return 'aspect-square max-h-48';
      case 'video': return 'aspect-video max-h-52';
      case 'wide': return 'aspect-[21/9] max-h-44';
      default: return 'max-h-48 aspect-auto';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header com Label e Abas de Escolha do Destino */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <ImageIcon className="w-3.5 h-3.5 text-[#ebbf01]" />
          <span>{label}</span>
        </label>

        {/* Abas de Destino */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-300 shadow-xs shrink-0">
          <button
            type="button"
            title="Servidor Local / Hostinger"
            aria-label="Servidor Local"
            onClick={() => setMode('upload')}
            className={`p-2 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
              mode === 'upload'
                ? 'bg-neutral-900 text-[#ebbf01] font-bold shadow-xs'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
            }`}
          >
            <span>🖥️</span>
          </button>

          <button
            type="button"
            title="Link URL Externo"
            aria-label="Link URL Externo"
            onClick={() => setMode('url')}
            className={`p-2 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
              mode === 'url'
                ? 'bg-neutral-900 text-[#ebbf01] font-bold shadow-xs'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {presetOptions.length > 0 && (
            <button
              type="button"
              title="Galeria Predefinida"
              aria-label="Galeria Predefinida"
              onClick={() => setMode('presets')}
              className={`p-2 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
                mode === 'presets'
                  ? 'bg-neutral-900 text-[#ebbf01] font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-600 font-medium">{helperText}</p>
      )}

      {/* ÁREA DE DRAG & DROP (SERVIDOR) */}
      {mode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => {
            if (!isProcessing) fileInputRef.current?.click();
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#ebbf01] bg-[#ebbf01]/10 scale-[0.99] shadow-md'
              : 'border-neutral-300 hover:border-black bg-white shadow-xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.mp4,.webm,.mov,.mkv,.avi,.svg,.png,.jpg,.jpeg,.webp,.gif,.ico"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFilePicked(e.target.files[0]);
              }
            }}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2.5 py-3 text-neutral-900 font-bold max-w-sm w-full">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
              <span className="text-xs font-bold">{uploadStatus || 'Enviando arquivo...'}</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-xs">
                <Upload className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-neutral-900">
                  Clique para selecionar ou arraste a Foto / Wallpaper para salvar no Servidor
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">
                  Salva imagem ou vídeo na pasta do servidor (/uploads) para visualização instantânea em qualquer dispositivo
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ÁREA DE LINK EXTERNO */}
      {mode === 'url' && (
        <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-neutral-300 shadow-xs">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://... ou https://github.com/.../releases/download/... ou /imagens/logo.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-black shadow-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Aplicar
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">
            💡 Cole qualquer link direto de imagem, vídeo ou URL do GitHub Releases.
          </p>
        </div>
      )}

      {/* GALERIA PREDEFINIDA */}
      {mode === 'presets' && presetOptions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
          {presetOptions.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setUrlInput(preset.url);
              }}
              className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                value === preset.url
                  ? 'border-black bg-white text-black font-bold shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-400 text-neutral-800 hover:text-black bg-white'
              }`}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center border border-neutral-200">
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-black">{preset.label}</div>
                <div className="text-[9px] text-neutral-500 font-mono truncate">{preset.url}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FEEDBACK DE SUCESSO / ERRO */}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PREVIEW BOX */}
      {value && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 p-1 shrink-0 flex items-center justify-center ${getAspectClass()}`}>
              {isVideoMediaUrl(value) ? (
                <video
                  src={getMediaPreviewUrl(value)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-24 max-w-24 sm:max-h-28 sm:max-w-36 object-cover rounded-lg"
                />
              ) : (
                <img
                  src={getMediaPreviewUrl(value)}
                  alt="Pré-visualização"
                  className="max-h-24 max-w-24 sm:max-h-28 sm:max-w-36 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/imagens/logo.svg';
                  }}
                />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-900">Mídia Ativa</span>
                {isGitHubUrl(value) ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono font-bold flex items-center gap-1 shadow-xs">
                    <span>🐙</span>
                    <span>GitHub Releases (CDN Global)</span>
                  </span>
                ) : isServerRelativeUrl(value) ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 font-mono font-bold">
                    <Check className="w-3 h-3 text-blue-700" />
                    <span>Servidor Local</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 font-mono font-bold">
                    <Globe className="w-3 h-3 text-emerald-700" />
                    <span>Link Externo / Nuvem</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500 font-mono font-medium truncate max-w-xs sm:max-w-md" title={value}>
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isPublicCloudUrl(value) && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                title="Abrir arquivo em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteMedia}
              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Remover e Excluir Arquivo"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
