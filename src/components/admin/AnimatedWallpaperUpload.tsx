import React, { useState, useRef } from 'react';
import { 
  Film, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  RefreshCw, 
  FileVideo, 
  ExternalLink, 
  Trash2,
  Github,
  Info
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { FileUploadField } from './FileUploadField';
import { ImageUploadField } from './ImageUploadField';
import { generateAndSaveVideoPreview, captureVideoFrameAsJpg, saveLightweightPreviewBlob } from '../../services/videoPreviewGenerator';
import { getMediaPreviewUrl, isVideoMediaUrl } from '../../utils/mediaUrl';

interface AnimatedWallpaperUploadProps {
  previewUrl: string;
  downloadUrl: string;
  videoUrl?: string;
  onChangePreview: (previewUrl: string) => void;
  onChangeDownload: (downloadUrl: string, meta?: { storageType?: string; assetId?: number; previewUrl?: string }) => void;
}

export const AnimatedWallpaperUpload: React.FC<AnimatedWallpaperUploadProps> = ({
  previewUrl,
  downloadUrl,
  videoUrl,
  onChangePreview,
  onChangeDownload,
}) => {
  const { brand } = useSiteData();
  const ghConfig = brand.githubStorage;
  const isGhConfigured = !!(ghConfig?.token && ghConfig?.owner && ghConfig?.repo);

  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [generateProgressText, setGenerateProgressText] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'auto' | 'manual'>('auto');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipulador para extrair prévia WebM de um arquivo de vídeo selecionado pelo usuário
  const handleExtractWebMFromFile = async (file: File) => {
    setIsGeneratingPreview(true);
    setGenerateProgressText('Lendo arquivo de vídeo...');
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      setGenerateProgressText('Gerando animação WebM ultraleve (4 segundos em loop)...');
      const result = await generateAndSaveVideoPreview(file, file.name, (msg) => {
        setGenerateProgressText(msg);
      });

      onChangePreview(result.previewUrl);
      setGenerateSuccess(`Prévia animada WebM gerada com sucesso (${(result.sizeBytes / 1024).toFixed(0)} KB)!`);
      setTimeout(() => setGenerateSuccess(null), 5000);
    } catch (err: any) {
      console.warn('Falha na geração de WebM animado, tentando captura de frame:', err);
      try {
        setGenerateProgressText('Tentando capturar frame do vídeo como poster...');
        const frameBlob = await captureVideoFrameAsJpg(file, 0.1);
        const frameUrl = await saveLightweightPreviewBlob(frameBlob, file.name);
        onChangePreview(frameUrl);
        setGenerateSuccess('Capa estática capturada do vídeo com sucesso!');
        setTimeout(() => setGenerateSuccess(null), 5000);
      } catch (frameErr: any) {
        setGenerateError(err?.message || 'Não foi possível extrair a prévia do vídeo selecionado.');
      }
    } finally {
      setIsGeneratingPreview(false);
      setGenerateProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isCurrentPreviewVideo = isVideoMediaUrl(previewUrl);

  return (
    <div className="space-y-6">
      {/* 1. Alerta Inteligente de Arquitetura: GitHub Releases vs Servidor */}
      <div className="p-4 rounded-2xl bg-black border border-amber-500/30 text-white space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#ebbf01] text-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#ebbf01]">
            Solução Inteligente para Vídeos Pesados (200MB a 300MB)
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Para não sobrecarregar nem encher o disco do seu servidor, o <strong>vídeo completo de download</strong> é enviado direto para o <strong>GitHub Releases</strong> (ou link externo). O sistema gera automaticamente uma <strong>Prévia Animada WebM Ultraleve (~800 KB)</strong> para a capa do site, permitindo animação contínua nos cards sem lentidão!
        </p>
        <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
          {isGhConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              GitHub Conectado: {ghConfig.owner}/{ghConfig.repo} ({ghConfig.defaultReleaseTag || 'v1.0'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              GitHub não configurado. Configure seu Token na aba &quot;Armazenamento &amp; GitHub&quot; para uploads diretos.
            </span>
          )}
        </div>
      </div>

      {/* 2. Campo 1: Upload do Vídeo Original de Download (GitHub Releases / Link) */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black uppercase text-neutral-900 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#ebbf01]" />
            1. Arquivo de Vídeo Original para Download (MP4 / WebM / MKV - até 2GB)
          </label>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ebbf01]/20 text-neutral-900">
            Hospedagem no GitHub
          </span>
        </div>

        <FileUploadField
          label=""
          value={downloadUrl || videoUrl || ''}
          onChange={(newUrl, meta) => {
            onChangeDownload(newUrl, meta);
            // Se gerou prévia animada durante o upload do vídeo, aplica automaticamente
            if (meta?.previewUrl) {
              onChangePreview(meta.previewUrl);
              setGenerateSuccess('Prévia animada WebM gerada automaticamente do vídeo!');
              setTimeout(() => setGenerateSuccess(null), 4000);
            }
          }}
          onPreviewGenerated={(newPreview) => {
            onChangePreview(newPreview);
            setGenerateSuccess('Prévia animada WebM gerada automaticamente do vídeo!');
            setTimeout(() => setGenerateSuccess(null), 4000);
          }}
          helperText="Envie o arquivo de vídeo completo para o GitHub Releases. Ao enviar, uma prévia animada WebM será gerada na hora para a capa!"
          accept=".webm,.mp4,.gif,.mov,.mkv,.avi"
        />
      </div>

      {/* 3. Campo 2: Capa e Prévia Animada WebM (Ultraleve para o site) */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black uppercase text-neutral-900 flex items-center gap-2">
            <Film className="w-4 h-4 text-[#ebbf01]" />
            2. Capa / Prévia Animada (WebM Ultraleve em Looping)
          </label>
          <div className="flex items-center gap-1 bg-neutral-200 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewTab('auto')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                previewTab === 'auto'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Extrair do Vídeo
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('manual')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                previewTab === 'manual'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Upload Manual
            </button>
          </div>
        </div>

        {/* Visualização ao Vivo da Capa / Prévia Atual */}
        {previewUrl ? (
          <div className="relative aspect-video max-h-56 w-full rounded-2xl overflow-hidden bg-black border border-neutral-300 shadow-inner group">
            {isCurrentPreviewVideo ? (
              <video
                src={getMediaPreviewUrl(previewUrl)}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getMediaPreviewUrl(previewUrl)}
                alt="Prévia do Wallpaper"
                className="w-full h-full object-cover"
              />
            )}

            {/* Badge de status sobre o player */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold font-mono text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isCurrentPreviewVideo ? 'Prévia Animada WebM Ativa (Looping)' : 'Capa Estática (Imagem)'}
              </span>
            </div>

            {/* Botão para limpar a prévia */}
            <div className="absolute top-2.5 right-2.5">
              <button
                type="button"
                onClick={() => onChangePreview('')}
                className="p-1.5 rounded-xl bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                title="Remover prévia"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-video max-h-48 w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100 flex flex-col items-center justify-center p-4 text-center">
            <Film className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-xs font-bold text-neutral-700">Nenhuma capa ou prévia animada definida</p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-sm">
              Envie o vídeo no campo acima para gerar a animação automaticamente, ou extraia abaixo de qualquer vídeo do seu computador.
            </p>
          </div>
        )}

        {/* Feedback de status ao vivo */}
        {isGeneratingPreview && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>{generateProgressText || 'Processando vídeo...'}</span>
          </div>
        )}

        {generateSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{generateSuccess}</span>
          </div>
        )}

        {generateError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{generateError}</span>
          </div>
        )}

        {/* Abas de Ação */}
        {previewTab === 'auto' ? (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleExtractWebMFromFile(file);
                }}
              />
              <button
                type="button"
                disabled={isGeneratingPreview}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs uppercase font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ebbf01]" />
                <span>⚡ Selecionar Vídeo e Gerar Prévia WebM (Loop 4s)</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Você pode selecionar o arquivo do seu vídeo (mesmo pesado de 200MB a 300MB). O navegador lê os primeiros 4 segundos, converte em um WebM animado levíssimo (~800 KB) e aplica instantaneamente à capa sem salvar o arquivo pesado no servidor.
            </p>
          </div>
        ) : (
          <div className="pt-1">
            <ImageUploadField
              label="Enviar Arquivo de Imagem, GIF ou WebM Curto para a Capa"
              value={previewUrl || ''}
              onChange={(url) => onChangePreview(url)}
              helperText="Envie um WebM leve, GIF animado ou imagem JPG/PNG para a capa."
              aspectRatio="video"
              compressAsJpg={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
