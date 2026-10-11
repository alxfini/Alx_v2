import { GitHubStorageConfig } from '../types';

export interface GitHubUploadResult {
  success: boolean;
  downloadUrl: string;
  previewUrl?: string;
  localUrl?: string;
  assetId: number;
  fileName: string;
  fileSize: number;
  releaseTag: string;
  error?: string;
}

export interface GitHubTestResult {
  success: boolean;
  message: string;
  repoName?: string;
  releaseTag?: string;
  releaseId?: number;
  assetsCount?: number;
}

/**
 * Normaliza o cabeçalho de autenticação do GitHub
 */
const getAuthHeaders = (token: string) => ({
  'Accept': 'application/vnd.github+json',
  'Authorization': `Bearer ${token.trim()}`,
  'X-GitHub-Api-Version': '2022-11-28',
});

/**
 * Garante que o repositório tenha pelo menos um commit inicial.
 * Repositórios recém-criados no GitHub sem marcar 'Add a README' ficam vazios (sem branch/commit),
 * o que causa erro 422 'Validation Failed' ao tentar criar uma Release ou Tag.
 */
async function ensureRepoHasInitialCommit(owner: string, repo: string, token: string): Promise<string> {
  try {
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: getAuthHeaders(token),
    });

    // Se retornar 409 (Git Repository is empty) ou 404:
    if (commitsRes.status === 409 || commitsRes.status === 404) {
      // Cria o primeiro commit com README.md para inicializar o branch 'main'
      const readmeBase64 = 'IyBBTFggU3RvcmFnZQoKUmVwb3PDrXTDs3JpbyBvZmljaWFsIHBhcmEgaG9zcGVkYWdlbSBkZSBpbnN0YWxhZG9yZXMgQVBLIGUgbcOtcWRpYXMgZG8gcG9ydGFsIEFMWC4=';
      await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Initial commit: Configurar armazenamento ALX Storage',
          content: readmeBase64,
        }),
      });

      // Aguarda 1.5s para o GitHub propagar a criação da branch 'main'
      await new Promise((r) => setTimeout(r, 1500));
    }
  } catch (e) {
    console.warn('Verificação de commit inicial:', e);
  }
  return 'main';
}

/**
 * Testa a conexão com o repositório e verifica/cria a release inicial
 */
export async function testGitHubConnection(config: GitHubStorageConfig): Promise<GitHubTestResult> {
  const token = config.token?.trim();
  const owner = config.owner?.trim();
  const repo = config.repo?.trim();
  const tag = (config.defaultReleaseTag || 'v1.0').trim();

  if (!token) {
    return { success: false, message: 'Token de Acesso Pessoal (PAT) do GitHub não informado.' };
  }
  if (!owner) {
    return { success: false, message: 'Usuário ou Organização do GitHub não informado.' };
  }
  if (!repo) {
    return { success: false, message: 'Nome do Repositório do GitHub não informado.' };
  }

  try {
    // 1. Testa acesso ao repositório
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getAuthHeaders(token),
    });

    if (repoRes.status === 401) {
      return { success: false, message: 'Token do GitHub inválido ou expirado. Gere um novo token com escopo "repo".' };
    }
    if (repoRes.status === 404) {
      return { success: false, message: `Repositório "${owner}/${repo}" não encontrado ou token sem permissão de acesso.` };
    }
    if (!repoRes.ok) {
      const errData = await repoRes.json().catch(() => ({}));
      return { success: false, message: `Erro ao acessar repositório: ${errData.message || repoRes.statusText}` };
    }

    const repoData = await repoRes.json();

    // 2. Garante que o repositório tenha pelo menos um commit inicial
    await ensureRepoHasInitialCommit(owner, repo, token);

    // 3. Procura release pela tag configurada
    const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
      headers: getAuthHeaders(token),
    });

    let releaseId: number | undefined;
    let assetsCount = 0;

    if (releaseRes.ok) {
      const releaseData = await releaseRes.json();
      releaseId = releaseData.id;
      assetsCount = Array.isArray(releaseData.assets) ? releaseData.assets.length : 0;
    } else {
      // Verifica se já existe qualquer release no repositório
      const allReleasesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        headers: getAuthHeaders(token),
      });

      if (allReleasesRes.ok) {
        const allReleases = await allReleasesRes.json();
        if (Array.isArray(allReleases) && allReleases.length > 0) {
          const matched = allReleases.find((r: any) => r.tag_name === tag) || allReleases[0];
          if (matched) {
            return {
              success: true,
              message: `Conexão bem-sucedida com "${repoData.full_name}"! Release ativa: "${matched.tag_name}".`,
              repoName: repoData.full_name,
              releaseTag: matched.tag_name,
              releaseId: matched.id,
              assetsCount: matched.assets?.length || 0,
            };
          }
        }
      }

      // Se não encontrou nenhuma release, cria com target_commitish definido
      const defaultBranch = repoData.default_branch || 'main';
      const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_name: tag,
          target_commitish: defaultBranch,
          name: `Releases & APKs (${tag})`,
          body: 'Armazenamento oficial de instaladores APK e arquivos de mídia do portal ALX.',
          draft: false,
          prerelease: false,
        }),
      });

      if (createRes.ok) {
        const newRel = await createRes.json();
        releaseId = newRel.id;
      } else {
        const createErr = await createRes.json().catch(() => ({}));
        
        // Se a tag já existe no git, tenta criar a release apontando para ela
        const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tag_name: tag,
            name: `Releases & APKs (${tag})`,
            draft: false,
          }),
        });

        if (fallbackRes.ok) {
          const fallbackRel = await fallbackRes.json();
          releaseId = fallbackRel.id;
        } else {
          return {
            success: false,
            message: `Repositório acessado, mas falha ao criar Release "${tag}": ${createErr.message || 'Validation Failed'}. Dica: Se o repositório estiver vazio, crie um arquivo README.md nele ou gere uma Release manualmente no GitHub com a tag "${tag}".`,
          };
        }
      }
    }

    return {
      success: true,
      message: `Conexão bem-sucedida com "${repoData.full_name}"! Release "${tag}" ativa e pronta para receber uploads.`,
      repoName: repoData.full_name,
      releaseTag: tag,
      releaseId,
      assetsCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha de rede ao conectar com GitHub: ${err?.message || 'Verifique sua conexão'}`,
    };
  }
}

/**
 * Obtém ou cria a Release pela tag
 */
export async function getOrCreateRelease(config: GitHubStorageConfig): Promise<{ releaseId: number; uploadUrl: string }> {
  const token = config.token?.trim() || '';
  const owner = config.owner?.trim() || '';
  const repo = config.repo?.trim() || '';
  const tag = (config.defaultReleaseTag || 'v1.0').trim();

  // 1. Verifica se release já existe pela tag
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
    headers: getAuthHeaders(token),
  });

  if (res.ok) {
    const data = await res.json();
    return {
      releaseId: data.id,
      uploadUrl: data.upload_url,
    };
  }

  // 2. Verifica se existe na lista geral de releases
  const listRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    headers: getAuthHeaders(token),
  });
  if (listRes.ok) {
    const list = await listRes.json();
    if (Array.isArray(list) && list.length > 0) {
      const match = list.find((r: any) => r.tag_name === tag) || list[0];
      if (match) {
        return {
          releaseId: match.id,
          uploadUrl: match.upload_url,
        };
      }
    }
  }

  // 3. Garante que o repo tenha commit inicial
  await ensureRepoHasInitialCommit(owner, repo, token);

  // 4. Cria a release
  const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: tag,
      target_commitish: 'main',
      name: `Armazenamento de Arquivos (${tag})`,
      body: 'Release criada automaticamente para upload de instaladores e arquivos grandes.',
      draft: false,
      prerelease: false,
    }),
  });

  if (!createRes.ok) {
    // Tenta sem target_commitish como fallback
    const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag_name: tag,
        name: `Armazenamento de Arquivos (${tag})`,
      }),
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      return {
        releaseId: fbData.id,
        uploadUrl: fbData.upload_url,
      };
    }

    const errData = await createRes.json().catch(() => ({}));
    throw new Error(`Não foi possível obter ou criar a Release no GitHub: ${errData.message || createRes.statusText}`);
  }

  const data = await createRes.json();
  return {
    releaseId: data.id,
    uploadUrl: data.upload_url,
  };
}

/**
 * Faz upload de um arquivo para o GitHub Releases via Proxy seguro (sem restrições de CORS)
 * com acompanhamento de progresso em tempo real
 */
export async function uploadToGitHubRelease(
  file: File,
  config: GitHubStorageConfig,
  onProgress?: (percent: number) => void
): Promise<GitHubUploadResult> {
  const token = config.token?.trim() || '';
  const owner = config.owner?.trim() || '';
  const repo = config.repo?.trim() || '';
  const tag = (config.defaultReleaseTag || 'v1.0').trim();

  if (!token || !owner || !repo) {
    throw new Error('Configuração do GitHub incompleta (Token, Usuário ou Repositório faltando).');
  }

  // Upload via Proxy no servidor (/api/github-upload.php) que envia para uploads.github.com
  // Isso resolve 100% dos bloqueios de CORS do navegador no domínio uploads.github.com
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('owner', owner);
    formData.append('repo', repo);
    formData.append('tag', tag);

    xhr.open('POST', '/api/github-upload.php', true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          resolve({
            success: true,
            downloadUrl: res.downloadUrl,
            previewUrl: res.previewUrl || res.localUrl || res.downloadUrl,
            localUrl: res.localUrl,
            assetId: res.assetId,
            fileName: res.fileName,
            fileSize: res.fileSize,
            releaseTag: res.releaseTag || tag,
          });
        } else {
          reject(new Error(res.error || `Erro no upload (HTTP ${xhr.status})`));
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          reject(new Error('Resposta inesperada do servidor após upload.'));
        } else {
          reject(new Error(`Falha no servidor ao processar o arquivo (HTTP ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erro de conexão ao enviar o arquivo para o servidor de upload.'));
    };

    xhr.send(formData);
  });
}

/**
 * Remove um arquivo de uma Release do GitHub via Proxy seguro
 */
export async function deleteGitHubReleaseAsset(
  config: GitHubStorageConfig,
  assetIdOrUrl: number | string
): Promise<{ success: boolean; message: string }> {
  const token = config.token?.trim() || '';
  const owner = config.owner?.trim() || '';
  const repo = config.repo?.trim() || '';
  const tag = (config.defaultReleaseTag || 'v1.0').trim();

  if (!token || !owner || !repo) {
    return { success: false, message: 'Configuração do GitHub incompleta.' };
  }

  try {
    const res = await fetch('/api/github-delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        owner,
        repo,
        assetId: typeof assetIdOrUrl === 'number' ? assetIdOrUrl : undefined,
        assetUrl: typeof assetIdOrUrl === 'string' ? assetIdOrUrl : undefined,
        defaultReleaseTag: tag,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({ success: true }));
      return { success: true, message: data.message || 'Arquivo excluído do GitHub Releases com sucesso!' };
    }

    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.error || `Falha ao excluir asset (HTTP ${res.status}).` };
  } catch (err: any) {
    return { success: false, message: `Erro ao conectar com o servidor: ${err?.message || 'Falha de rede'}` };
  }
}

/**
 * Remove um arquivo local do servidor (/public/uploads ou /aplicativos)
 */
export async function deleteServerFile(filePath: string): Promise<{ success: boolean; message: string }> {
  if (!filePath) return { success: false, message: 'Caminho do arquivo não fornecido.' };

  try {
    const res = await fetch('/api/delete-file.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filepath: filePath }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({ success: true }));
      return { success: true, message: data.message || 'Arquivo excluído do servidor.' };
    }

    return { success: false, message: 'Não foi possível excluir o arquivo do servidor.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao conectar ao servidor.' };
  }
}
