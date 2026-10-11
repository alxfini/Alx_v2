import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  HardDrive, 
  ExternalLink,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { 
  uploadToGitHubRelease, 
  deleteGitHubReleaseAsset, 
  deleteServerFile 
} from '../../services/githubStorageService';
import { generateLightweightVideoPreview, captureVideoFrameAsJpg } from '../../services/videoPreviewGenerator';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string, meta?: { storageType?: 'server' | 'github' | 'external'; assetId?: number; previewUrl?: string }) => void;
  onPreviewGenerated?: (previewUrl: string) => void;
  helperText?: string;
  currentAssetId?: number;
  currentStorageType?: 'server' | 'github' | 'external';
  onDeleteCurrentFile?: () => Promise<void> | void;
  accept?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  onPreviewGenerated,
  helperText = 'Faça upload do arquivo para o GitHub Releases ou Servidor, ou cole um link externo de download.',
  currentAssetId,
  currentStorageType,
  onDeleteCurrentFile,
  accept = '.apk,.zip,.rar,.bin,.tar.gz,.exe,.dmg,.iso,.mp4,.webm,.mov,.mkv,.avi',
}) => {
  const { brand } = useSiteData();
  const ghConfig = brand.githubStorage;
  const isGhConfigured = !!(ghConfig?.token && ghConfig?.owner && ghConfig?.repo);

  // Determina o modo inicial baseado no valor existente
  const initialMode = () => {
    if (!value) return isGhConfigured ? 'github' : 'server';
    if (value.includes('github.com') && value.includes('/releases/')) return 'github';
    if (value.startsWith('/uploads/') || value.startsWith('/aplicativos/')) return 'server';
    return 'url';
  };

  const [mode, setMode] = useState<'github' | 'server' | 'url'>(initialMode);
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoDeletePrevious, setAutoDeletePrevious] = useState(true);
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
  const isServerUrl = (url: string) => url?.startsWith('/uploads/') || url?.startsWith('/aplicativos/');

  // Gera e envia prévia animada WebM leve para vídeos grandes
  const handleGenerateAndSaveVideoPreview = async (videoFile: File): Promise<string | null> => {
    try {
      setUploadStatusText('Gerando prévia animada ultraleve (WebM)...');
      const previewBlob = await generateLightweightVideoPreview(videoFile, {
        durationSeconds: 4,
        targetWidth: 640,
        fps: 24,
        onProgress: (msg) => setUploadStatusText(msg),
      });

      // Salva a prévia leve no servidor
      const previewFile = new File([previewBlob], `preview_${videoFile.name.replace(/\.[^/.]+$/, '')}.webm`, {
        type: previewBlob.type || 'video/webm',
      });

      const formData = new FormData();
      formData.append('file', previewFile);

      const res = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.success && data?.url) {
          if (onPreviewGenerated) {
            onPreviewGenerated(data.url);
          }
          return data.url;
        }
      }
    } catch (previewErr) {
      console.warn('Geração de prévia WebM em fallback para captura de frame:', previewErr);
      try {
        const frameBlob = await captureVideoFrameAsJpg(videoFile, 0.1);
        const frameFile = new File([frameBlob], `poster_${videoFile.name.replace(/\.[^/.]+$/, '')}.jpg`, {
          type: 'image/jpeg',
        });
        const formData = new FormData();
        formData.append('file', frameFile);
        const res = await fetch('/api/upload.php', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.success && data?.url) {
            if (onPreviewGenerated) onPreviewGenerated(data.url);
            return data.url;
          }
        }
      } catch (frameErr) {
        console.warn('Erro ao gerar poster de frame:', frameErr);
      }
    }
    return null;
  };

  // Upload para GitHub Releases
  const handleUploadToGitHub = async (file: File) => {
    if (!ghConfig || !isGhConfigured) {
      setErrorMsg('GitHub não configurado. Vá na aba "Armazenamento & GitHub" no painel e configure seu Token e Repositório.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);
    setFileSizeStr(formatBytes(file.size));
    setUploadStatusText('Iniciando conexão com GitHub...');

    // Salva o link anterior para deletar se autoDeletePrevious estiver marcado
    const previousUrl = value;
    const previousAssetId = currentAssetId;

    const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i));

    try {
      // Se for vídeo, gera a prévia animada WebM leve em segundo plano
      let generatedPreviewUrl: string | null = null;
      if (isVideo) {
        generatedPreviewUrl = await handleGenerateAndSaveVideoPreview(file);
      }

      setUploadStatusText('Enviando para GitHub Releases...');
      const result = await uploadToGitHubRelease(file, ghConfig, (percent) => {
        setUploadProgress(percent);
        setUploadStatusText(`Enviando para GitHub Releases... ${percent}%`);
      });

      // Se havia uma versão anterior diferente e a opção está marcada, apaga a versão antiga
      if (autoDeletePrevious && previousUrl && previousUrl !== result.downloadUrl) {
        setUploadStatusText('Excluindo versão anterior para não sobrecarregar...');
        try {
          if (isGitHubUrl(previousUrl)) {
            await deleteGitHubReleaseAsset(ghConfig, previousAssetId || previousUrl);
          } else if (isServerUrl(previousUrl)) {
            await deleteServerFile(previousUrl);
          }
        } catch (delErr) {
          console.warn('Aviso ao apagar versão antiga:', delErr);
        }
      }

      onChange(result.downloadUrl, {
        storageType: 'github',
        assetId: result.assetId,
        previewUrl: generatedPreviewUrl || result.previewUrl,
      });

      setUrlInput(result.downloadUrl);
      setSuccessMsg(`Upload concluído! Arquivo hospedado no GitHub Releases (${formatBytes(result.fileSize)})${generatedPreviewUrl ? ' com prévia animada gerada' : ''}.`);
    } catch (err: any) {
      console.error('Erro no upload GitHub:', err);
      setErrorMsg(err?.message || 'Falha ao enviar arquivo para o GitHub Releases.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  // Upload para o Servidor Local
  const handleUploadToServer = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);
    setFileSizeStr(formatBytes(file.size));
    setUploadStatusText('Enviando para o servidor...');

    const previousUrl = value;
    const previousAssetId = currentAssetId;
    const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i));

    try {
      let generatedPreviewUrl: string | null = null;
      if (isVideo) {
        generatedPreviewUrl = await handleGenerateAndSaveVideoPreview(file);
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro no envio para o servidor.');
      }

      const data = await res.json();
      const newUrl = data.url;

      // Se autoDeletePrevious estiver ativo e havia um arquivo anterior
      if (autoDeletePrevious && previousUrl && previousUrl !== newUrl) {
        setUploadStatusText('Removendo versão anterior...');
        try {
          if (isGitHubUrl(previousUrl) && ghConfig && isGhConfigured) {
            await deleteGitHubReleaseAsset(ghConfig, previousAssetId || previousUrl);
          } else if (isServerUrl(previousUrl)) {
            await deleteServerFile(previousUrl);
          }
        } catch (delErr) {
          console.warn('Aviso ao apagar arquivo antigo:', delErr);
        }
      }

      onChange(newUrl, { storageType: 'server', previewUrl: generatedPreviewUrl || newUrl });
      setUrlInput(newUrl);
      setSuccessMsg(`Arquivo salvo no servidor local (${formatBytes(file.size)})!`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao enviar arquivo para o servidor.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  const handleFilePicked = (file: File) => {
    if (mode === 'github') {
      handleUploadToGitHub(file);
    } else {
      handleUploadToServer(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFilePicked(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFilePicked(file);
  };

  const handleDeleteCurrent = async () => {
    if (!value) return;
    if (!window.confirm('Tem certeza que deseja excluir este arquivo físico do armazenamento?')) return;

    setIsDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (onDeleteCurrentFile) {
        await onDeleteCurrentFile();
      } else if (isGitHubUrl(value) && ghConfig && isGhConfigured) {
        await deleteGitHubReleaseAsset(ghConfig, currentAssetId || value);
      } else if (isServerUrl(value)) {
        await deleteServerFile(value);
      }

      onChange('', { storageType: 'external', previewUrl: '' });
      setUrlInput('');
      setFileName(null);
      setFileSizeStr(null);
      setSuccessMsg('Arquivo excluído com sucesso do armazenamento!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao excluir arquivo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 text-neutral-900 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200">
      {/* Cabeçalho e Seletores de Destino */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-[#ebbf01]" />
          <span>{label}</span>
        </label>

        {/* Abas de Escolha do Destino (Apenas Ícones para evitar sobreposição) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-xs shrink-0">
          <button
            type="button"
            title="GitHub Releases (até 2GB)"
            aria-label="GitHub Releases"
            onClick={() => setMode('github')}
            className={`p-2 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
              mode === 'github'
                ? 'bg-[#24292e] text-white shadow-xs'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <span>🐙</span>
          </button>

          <button
            type="button"
            title="Servidor Local / Hostinger"
            aria-label="Servidor Local"
            onClick={() => setMode('server')}
            className={`p-2 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
              mode === 'server'
                ? 'bg-neutral-900 text-[#ebbf01] shadow-xs'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
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
                ? 'bg-neutral-900 text-[#ebbf01] shadow-xs'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta se escolheu GitHub mas não configurou */}
      {mode === 'github' && !isGhConfigured && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Integração GitHub ainda não configurada no Painel</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Para fazer upload automático de APKs de até 2GB para o GitHub Releases, configure o <strong>Token</strong> e o <strong>Repositório</strong> na aba <strong>"Armazenamento & GitHub"</strong> do painel administrativo.
            </p>
          </div>
        </div>
      )}

      {/* ÁREA DE DRAG & DROP PARA GITHUB OU SERVIDOR */}
      {(mode === 'github' || mode === 'server') && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-2xl p-5 transition-all text-center relative cursor-pointer ${
              isDragging
                ? 'border-[#ebbf01] bg-[#ebbf01]/10'
                : mode === 'github'
                ? 'border-neutral-300 hover:border-black bg-white hover:bg-neutral-50/50'
                : 'border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />

            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-neutral-900 animate-spin" />
                ) : mode === 'github' ? (
                  <span className="text-xl">🐙</span>
                ) : (
                  <Upload className="w-5 h-5 text-neutral-900" />
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-neutral-900">
                  {isUploading
                    ? uploadStatusText || 'Enviando arquivo...'
                    : fileName
                    ? `Arquivo selecionado: ${fileName}`
                    : `Clique para selecionar ou arraste o arquivo aqui (${mode === 'github' ? 'Destino: GitHub Releases' : 'Destino: Servidor Local'})`}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {fileSizeStr
                    ? `Tamanho: ${fileSizeStr}`
                    : mode === 'github'
                    ? 'Hospedagem gratuita de até 2GB por arquivo com link direto veloz (CDN Microsoft/GitHub)'
                    : 'Suporta arquivos APK, ZIP, RAR de até 100MB salvos no servidor'}
                </p>
              </div>

              {/* Barra de Progresso em Tempo Real */}
              {isUploading && (
                <div className="max-w-md mx-auto space-y-1.5 pt-2">
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-black h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress || 10}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-600 font-bold">
                    <span>{uploadStatusText}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opção Inteligente: Apagar Versão Anterior Automaticamente */}
          {value && (
            <div className="flex items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 select-none">
                <input
                  type="checkbox"
                  checked={autoDeletePrevious}
                  onChange={(e) => setAutoDeletePrevious(e.target.checked)}
                  className="rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                />
                <span className="text-[11px]">
                  Substituir e apagar versão anterior do armazenamento ao subir um novo APK (evita sobrecarga)
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* ÁREA DE LINK EXTERNO */}
      {mode === 'url' && (
        <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-neutral-200">
          <label className="text-[11px] font-mono font-bold text-neutral-700 block">
            Link direto ou externo de download:
          </label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value, { storageType: 'external' });
            }}
            placeholder="https://drive.google.com/file/d/... ou https://mediafire.com/... ou https://github.com/..."
            className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-mono focus:outline-none focus:border-black shadow-xs"
          />
          <div className="text-[10px] text-neutral-500 font-mono">
            Cole a URL de download (Google Drive, Dropbox, Mediafire, Mega ou servidor externo).
          </div>
        </div>
      )}

      {/* CARD DO ARQUIVO ATUALMENTE CONFIGURADO + BOTÕES DE AÇÃO */}
      {value && (
        <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">Arquivo Vinculado</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isGitHubUrl(value)
                    ? 'bg-neutral-900 text-white'
                    : isServerUrl(value)
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {isGitHubUrl(value) ? '🐙 GitHub Releases' : isServerUrl(value) ? '🖥️ Servidor Local' : '🔗 Link Externo'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 truncate max-w-md" title={value}>
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Testar link de download"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
              <span>Testar Link</span>
            </a>

            {/* BOTÃO DE EXCLUSÃO MANUAL DO ARMAZENAMENTO */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleDeleteCurrent()}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-xs font-bold border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Excluir o arquivo físico do GitHub Releases ou do Servidor"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>Excluir do Armazenamento</span>
            </button>
          </div>
        </div>
      )}

      {/* MENSAGENS DE FEEDBACK */}
      {successMsg && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-start gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {helperText && <p className="text-[10px] text-neutral-500 font-medium">{helperText}</p>}
    </div>
  );
};
