import React, { useState } from 'react';
import { 
  HardDrive, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Save, 
  Sparkles, 
  Info, 
  Copy, 
  ShieldCheck, 
  Check, 
  Eye, 
  EyeOff,
  Trash2,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { testGitHubConnection, GitHubTestResult } from '../../services/githubStorageService';
import { GitHubStorageConfig } from '../../types';

export const GitHubStorageTab: React.FC = () => {
  const { brand, updateBrand } = useSiteData();
  const currentGh = brand.githubStorage || {
    enabled: false,
    token: '',
    owner: '',
    repo: '',
    defaultReleaseTag: 'v1.0',
  };

  const [ownerInput, setOwnerInput] = useState(currentGh.owner || '');
  const [repoInput, setRepoInput] = useState(currentGh.repo || '');
  const [tokenInput, setTokenInput] = useState(currentGh.token || '');
  const [tagInput, setTagInput] = useState(currentGh.defaultReleaseTag || 'v1.0');
  const [showToken, setShowToken] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<GitHubTestResult | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveSuccessMsg(null);

    const configToTest: GitHubStorageConfig = {
      enabled: true,
      owner: ownerInput.trim(),
      repo: repoInput.trim(),
      token: tokenInput.trim(),
      defaultReleaseTag: tagInput.trim() || 'v1.0',
    };

    const res = await testGitHubConnection(configToTest);
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      updateBrand({
        githubStorage: {
          ...configToTest,
          lastTestedAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: GitHubStorageConfig = {
      enabled: !!(tokenInput.trim() && ownerInput.trim() && repoInput.trim()),
      owner: ownerInput.trim(),
      repo: repoInput.trim(),
      token: tokenInput.trim(),
      defaultReleaseTag: tagInput.trim() || 'v1.0',
      lastTestedAt: currentGh.lastTestedAt,
    };

    updateBrand({ githubStorage: updated });
    setSaveSuccessMsg('Configurações do GitHub Releases salvas com sucesso!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const isConfigured = !!(currentGh.token && currentGh.owner && currentGh.repo);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-neutral-900">
      
      {/* Top Banner / Card Principal */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-[#ebbf01] flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            🐙
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-neutral-900 font-heading">
                Integração GitHub Releases (Armazenamento de APKs & Apps de até 2GB)
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isConfigured 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isConfigured ? '✅ Conexão Configurada' : '⚠️ Pendente de Configuração'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              Hospede arquivos APK pesados, atualizações OTA e instaladores de até <strong>2 GB por arquivo</strong> gratuitamente na infraestrutura do GitHub Releases com links de download diretos velozes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
            <span>Criar Token no GitHub</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Configuração (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-neutral-900" />
                <h4 className="text-base font-extrabold text-neutral-900 font-heading">
                  Credenciais do Repositório & Token
                </h4>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 font-medium">
                Conexão Direta via API REST
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Usuário / Organização */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 block">
                  1. Usuário ou Organização do GitHub (Owner) *
                </label>
                <input
                  type="text"
                  required
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  placeholder="ex: alxrdrgo ou sua-organizacao"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-mono font-bold placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">
                  O nome exato do seu perfil no GitHub (aparece na URL do seu perfil: github.com/<strong>seu-usuario</strong>).
                </p>
              </div>

              {/* Nome do Repositório */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 block">
                  2. Nome do Repositório para os Arquivos (Repo) *
                </label>
                <input
                  type="text"
                  required
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="ex: alx-storage-apks ou alx-releases"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-mono font-bold placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">
                  O repositório onde as releases e arquivos serão anexados (crie um repositório no seu GitHub para isso).
                </p>
              </div>

              {/* Personal Access Token (PAT) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800">
                    3. Personal Access Token (PAT) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] font-mono text-neutral-600 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showToken ? 'Ocultar' : 'Exibir Token'}</span>
                  </button>
                </div>
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-mono placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">
                  Token gerado em <code>Developer Settings &gt; Personal access tokens (classic)</code> com a permissão <strong>repo</strong> selecionada.
                </p>
              </div>

              {/* Tag da Release */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 block">
                  4. Tag Padrão da Release no GitHub
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="v1.0"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 font-mono font-bold placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">
                  Tag da Release que agrupará os downloads (o sistema cria esta Release automaticamente se ela ainda não existir).
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isTesting || !ownerInput.trim() || !repoInput.trim() || !tokenInput.trim()}
                  onClick={handleTest}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#ebbf01]" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-[#ebbf01]" />
                  )}
                  <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão com GitHub'}</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs uppercase hover:bg-[#f5cc14] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </form>

            {/* Feedback do Teste */}
            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.success ? 'Conexão Aprovada!' : 'Falha na Conexão'}</span>
                </div>
                <p className="leading-relaxed">{testResult.message}</p>
                {testResult.success && testResult.repoName && (
                  <div className="pt-1 font-mono text-[11px] text-emerald-800">
                    <div>Repositório: <strong>{testResult.repoName}</strong></div>
                    <div>Release Tag: <strong>{testResult.releaseTag}</strong> (ID: {testResult.releaseId})</div>
                    <div>Arquivos na Release: <strong>{testResult.assetsCount || 0}</strong></div>
                  </div>
                )}
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Passo a Passo Tutorial (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1 pb-3 border-b border-neutral-800">
              <span className="text-[10px] font-mono font-bold text-[#ebbf01] uppercase tracking-wider block">
                Guia Rápido de Configuração
              </span>
              <h4 className="text-lg font-black text-white font-heading">
                Como Configurar o GitHub em 3 Minutos
              </h4>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Passo 1 */}
              <div className="p-4 rounded-2xl bg-[#16161D] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#ebbf01] text-black font-extrabold flex items-center justify-center font-mono text-xs">
                    1
                  </span>
                  <span className="font-bold text-white text-sm">Crie o Repositório no GitHub</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Entre em sua conta no GitHub e crie um novo repositório (ex: <code className="text-[#ebbf01]">alx-storage-apks</code>). Pode ser Público ou Privado.
                </p>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ebbf01] hover:underline pt-1"
                >
                  Abrir Criador de Repositório ↗
                </a>
              </div>

              {/* Passo 2 */}
              <div className="p-4 rounded-2xl bg-[#16161D] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#ebbf01] text-black font-extrabold flex items-center justify-center font-mono text-xs">
                    2
                  </span>
                  <span className="font-bold text-white text-sm">Gere seu Token de Acesso (PAT)</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Acesse <code>Settings &gt; Developer Settings &gt; Personal access tokens &gt; Tokens (classic)</code>.
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-1 text-[11px] pl-1">
                  <li>Clique em <strong>Generate new token (classic)</strong></li>
                  <li>Dê um nome (ex: <code>Alx Storage</code>)</li>
                  <li>Marque a caixinha: <strong className="text-white">[✓] repo</strong> (acesso a repositórios e releases)</li>
                  <li>Clique em <strong>Generate token</strong> e copie o código (começa com <code>ghp_...</code>)</li>
                </ul>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ebbf01] hover:underline pt-1"
                >
                  Gerar Token Classic Direto ↗
                </a>
              </div>

              {/* Passo 3 */}
              <div className="p-4 rounded-2xl bg-[#16161D] border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#ebbf01] text-black font-extrabold flex items-center justify-center font-mono text-xs">
                    3
                  </span>
                  <span className="font-bold text-white text-sm">Cole os Dados & Salve</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Cole o seu usuário, o nome do repositório e o token no formulário ao lado. Clique em <strong>Testar Conexão</strong> e depois em <strong>Salvar Configurações</strong>.
                </p>
              </div>

            </div>

            {/* Card Explicativo: Versões & Exclusão Automática */}
            <div className="p-4 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/20 space-y-2">
              <div className="flex items-center gap-2 text-[#ebbf01] font-bold text-xs">
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Como Funciona a Atualização de APKs:</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Ao atualizar um aplicativo existente (ex: <em>App de Música</em>) e subir uma nova versão, o sistema mantém uma opção marcada por padrão:
                <br /><br />
                <code className="text-white font-bold bg-black/40 px-1.5 py-0.5 rounded">[✓] Apagar versão anterior do armazenamento</code>
                <br /><br />
                Com isso, a versão antiga é automaticamente deletada do GitHub Releases, mantendo apenas a versão mais recente e evitando sobrecarga ou custo. Além disso, há sempre um botão de exclusão manual no cadastro.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
