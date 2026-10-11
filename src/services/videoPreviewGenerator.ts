/**
 * Utilitário inteligente para geração de Prévia Animada Leve (WebM / Imagem) a partir de Vídeo.
 * Permite que vídeos pesados de 200MB a 500MB (hospedados no GitHub Releases para download)
 * tenham uma prévia animada ultraleve (400KB - 1.2MB) em WebM gerada diretamente no navegador,
 * garantindo animação perfeita nos cards sem sobrecarregar o servidor nem a conexão dos visitantes.
 */

export interface VideoPreviewGenerationResult {
  previewBlob: Blob;
  previewUrl: string;
  duration: number;
  width: number;
  height: number;
  format: 'video/webm' | 'image/jpeg';
}

/**
 * Extrai os primeiros N segundos de um vídeo pesado em um WebM animado ultraleve (480p/640p)
 * usando MediaStream Recording do elemento HTMLVideoElement + HTMLCanvasElement.
 */
export async function generateLightweightVideoPreview(
  videoInput: File | string,
  options: {
    durationSeconds?: number;
    targetWidth?: number;
    fps?: number;
    startTimeSeconds?: number;
    onProgress?: (text: string) => void;
  } = {}
): Promise<Blob> {
  const {
    durationSeconds = 4,   // 4 segundos de loop animado
    targetWidth = 640,      // 640px de largura é ideal e levíssimo (~800KB)
    fps = 24,
    startTimeSeconds = 0.2, // Pula os primeiros 0.2s para evitar frames pretos iniciais
    onProgress,
  } = options;

  onProgress?.('Carregando vídeo para geração da prévia animada...');

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    (video as any).defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    let fileUrl = '';
    if (typeof videoInput === 'string') {
      fileUrl = videoInput;
    } else {
      fileUrl = URL.createObjectURL(videoInput);
    }
    video.src = fileUrl;

    let isCleanedUp = false;
    let animFrameId: number | null = null;
    let timeoutId: any = null;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (typeof videoInput !== 'string' && fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
      } catch {}
    };

    // Timeout de segurança para não travar o navegador
    timeoutId = setTimeout(() => {
      if (!isCleanedUp) {
        console.warn('Timeout na geração do WebM animado, tentando captura de frame estático');
        fallbackCaptureFrame();
      }
    }, 14000);

    const fallbackCaptureFrame = () => {
      try {
        const origWidth = video.videoWidth || 640;
        const origHeight = video.videoHeight || 360;
        const scale = Math.min(1, targetWidth / origWidth);
        const width = Math.round(origWidth * scale);
        const height = Math.round(origHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          canvas.toBlob(
            (b) => {
              cleanup();
              if (b) resolve(b);
              else reject(new Error('Falha ao gerar captura de fallback'));
            },
            'image/jpeg',
            0.88
          );
          return;
        }
      } catch (err) {
        // ignora
      }
      cleanup();
      reject(new Error('Tempo limite excedido na leitura do vídeo'));
    };

    video.onloadedmetadata = async () => {
      try {
        const origWidth = video.videoWidth || 1280;
        const origHeight = video.videoHeight || 720;
        const scale = Math.min(1, targetWidth / origWidth);
        const width = Math.round(origWidth * scale);
        const height = Math.round(origHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas 2D context não suportado'));
        }

        // Verifica suporte a MediaRecorder e WebM
        let mimeType = 'video/webm;codecs=vp9';
        if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }

        if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported(mimeType)) {
          // Fallback: se navegador não suportar MediaRecorder em canvas, captura o primeiro frame como JPG
          video.currentTime = Math.min(1, Math.max(startTimeSeconds, (video.duration || 4) / 4));
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, width, height);
            canvas.toBlob(
              (b) => {
                cleanup();
                if (b) resolve(b);
                else reject(new Error('Falha ao gerar thumbnail de fallback'));
              },
              'image/jpeg',
              0.88
            );
          };
          return;
        }

        // Posiciona no segundo inicial desejado
        if (startTimeSeconds > 0 && (video.duration || 10) > startTimeSeconds) {
          video.currentTime = startTimeSeconds;
        }

        const stream = (canvas as any).captureStream ? (canvas as any).captureStream(fps) : null;
        if (!stream) {
          fallbackCaptureFrame();
          return;
        }

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1000000, // ~1.0 Mbps = ~500KB para 4 segundos
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve(finalBlob);
        };

        const startTime = Date.now();
        const maxDurationMs = durationSeconds * 1000;

        const drawLoop = () => {
          if (isCleanedUp) return;
          try {
            ctx.drawImage(video, 0, 0, width, height);
          } catch {}

          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / maxDurationMs) * 100));
          onProgress?.(`Criando prévia animada ultraleve (WebM)... ${pct}%`);

          if (elapsed >= maxDurationMs) {
            if (animFrameId) cancelAnimationFrame(animFrameId);
            if (recorder.state === 'recording') {
              try { recorder.stop(); } catch {}
            }
          } else {
            animFrameId = requestAnimationFrame(drawLoop);
          }
        };

        recorder.start(100);

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Reprodução em segundo plano bloqueada pelo navegador, usando loop de frames:', playErr);
        }

        drawLoop();
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Não foi possível decodificar o vídeo para prévia. Verifique o formato do arquivo.'));
    };
  });
}

/**
 * Salva a prévia ultraleve gerada (WebM ou JPG) no servidor (/api/upload.php) ou em Data URL permanente.
 */
export async function saveLightweightPreviewBlob(blob: Blob, baseName: string = 'wallpaper'): Promise<string> {
  const isWebm = (blob.type || '').includes('webm');
  const ext = isWebm ? 'webm' : 'jpg';
  const cleanBase = baseName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = `preview_${cleanBase}_${Date.now()}.${ext}`;

  // 1. Tenta salvar no servidor local (/api/upload.php)
  try {
    const previewFile = new File([blob], safeFileName, {
      type: blob.type || (isWebm ? 'video/webm' : 'image/jpeg'),
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
        return data.url;
      }
    }
  } catch (uploadErr) {
    console.warn('Não foi possível gravar no endpoint /api/upload.php:', uploadErr);
  }

  // 2. Fallback: Converte em Base64 Data URL (garante que nunca se perca)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve(URL.createObjectURL(blob));
      }
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(blob));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Gera e salva a prévia animada WebM ultraleve em uma única chamada
 */
export async function generateAndSaveVideoPreview(
  videoInput: File | string,
  baseName: string = 'wallpaper',
  onProgress?: (msg: string) => void
): Promise<{ previewUrl: string; isAnimated: boolean; sizeBytes: number }> {
  const blob = await generateLightweightVideoPreview(videoInput, {
    durationSeconds: 4,
    targetWidth: 640,
    fps: 24,
    onProgress,
  });

  const previewUrl = await saveLightweightPreviewBlob(blob, baseName);
  const isAnimated = (blob.type || '').includes('webm');

  return {
    previewUrl,
    isAnimated,
    sizeBytes: blob.size,
  };
}

/**
 * Captura um poster de frame (JPG de alta qualidade) do vídeo
 */
export async function captureVideoFrameAsJpg(
  videoInput: File | string,
  timePercent: number = 0.1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    (video as any).defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.crossOrigin = 'anonymous';

    let fileUrl = '';
    if (typeof videoInput === 'string') {
      fileUrl = videoInput;
    } else {
      fileUrl = URL.createObjectURL(videoInput);
    }
    video.src = fileUrl;

    const cleanup = () => {
      try {
        video.pause();
        if (typeof videoInput !== 'string' && fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
      } catch {}
    };

    video.onloadedmetadata = () => {
      video.currentTime = Math.max(0.1, (video.duration || 1) * timePercent);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(1280, video.videoWidth || 1280);
        const scale = canvas.width / (video.videoWidth || 1280);
        canvas.height = Math.round((video.videoHeight || 720) * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas context indisponível'));
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (b) => {
            cleanup();
            if (b) resolve(b);
            else reject(new Error('Erro ao capturar frame'));
          },
          'image/jpeg',
          0.88
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Erro ao carregar vídeo para captura de poster.'));
    };
  });
}
