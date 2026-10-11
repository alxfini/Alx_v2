import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Download, 
  Eye, 
  EyeOff, 
  Server, 
  ShieldCheck, 
  HelpCircle,
  HardDriveDownload,
  Check
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

interface DbStatus {
  configured: boolean;
  connected: boolean;
  host: string;
  dbname: string;
  user: string;
  port: number;
  hasData: boolean;
  lastUpdated?: string | null;
  dataSize?: number;
  message?: string;
  error?: string | null;
}

interface DatabaseTabProps {
  onTriggerSuccess?: (msg: string) => void;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ onTriggerSuccess }) => {
  const { currentDataSnapshot, publishOnline } = useSiteData();

  const [status, setStatus] = useState<DbStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [host, setHost] = useState<string>('localhost');
  const [dbname, setDbname] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [port, setPort] = useState<number>(3306);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mysql-config.php');
      if (res.ok) {
        const data: DbStatus = await res.json();
        setStatus(data);
        if (data.host) setHost(data.host);
        if (data.dbname) setDbname(data.dbname);
        if (data.user) setUser(data.user);
        if (data.port) setPort(data.port);
      }
    } catch (e: any) {
      console.warn('Could not fetch MySQL status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbname.trim() || !user.trim()) {
      setMessage({ type: 'error', text: 'Informe o Nome do Banco de Dados e o Usuário MySQL da Hostinger.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/mysql-config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_and_save',
          host: host.trim() || 'localhost',
          dbname: dbname.trim(),
          user: user.trim(),
          pass: pass,
          port: port || 3306,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({ type: 'success', text: result.message || 'Banco de dados configurado com sucesso!' });
        onTriggerSuccess?.('Banco MySQL conectado e configurado com sucesso!');
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao conectar no banco MySQL da Hostinger.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Falha na comunicação com o servidor.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncCurrentData = async () => {
    setIsSyncing(true);
    setMessage(null);
    try {
      // Executa publishOnline com segurança (grava no localStorage e envia para /api/save.php)
      const res = await publishOnline();
      if (res && res.success) {
        setMessage({ 
          type: 'success', 
          text: res.message || 'Todos os cadastros e aplicativos foram gravados com sucesso no Servidor e MySQL!' 
        });
        onTriggerSuccess?.(res.message || 'Dados gravados no servidor com sucesso!');
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: res?.message || 'Erro ao sincronizar dados com o MySQL/Servidor.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Falha ao sincronizar dados com o servidor.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadSql = () => {
    window.location.href = '/api/mysql-config.php?action=download_sql';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-[#ebbf01] flex items-center justify-center shrink-0 shadow-md">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 font-heading">
                  Banco de Dados MySQL
                </h3>
                {status?.connected ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conectado & Ativo</span>
                  </span>
                ) : status?.configured ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Verificar Conexão</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-neutral-100 text-neutral-700 border border-neutral-200">
                    <Server className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Modo Arquivo JSON</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
                Conecte seu banco de dados MySQL nativo da Hostinger. Seus cadastros, imagens, aplicativos e configurações 
                ficarão salvos de forma <strong>definitiva e permanente</strong>, imunes a deploys do GitHub, 
                troca de dispositivos ou limpezas de cache.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Recarregar status da conexão"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar Status</span>
            </button>
          </div>
        </div>

        {/* Status Callout Box */}
        {status?.connected && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Banco MySQL ativo no Hostinger ({status.host} / {status.dbname})
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {status.hasData 
                    ? `Tabela site_data sincronizada. Última atualização: ${status.lastUpdated ? new Date(status.lastUpdated).toLocaleString('pt-BR') : 'recente'}` 
                    : 'Tabela criada, pronta para receber dados.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSyncCurrentData}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Agora</span>
            </button>
          </div>
        )}

        {status && !status.connected && status.configured && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-900">
                Atenção: Não foi possível conectar ao banco MySQL com as credenciais salvas.
              </p>
              <p className="text-amber-800 font-medium">
                {status.error || 'Verifique se o banco de dados, usuário e senha foram criados corretamente no hPanel da Hostinger.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Box (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-neutral-900 font-heading">
              Credenciais do Banco de Dados MySQL (Hostinger)
            </h4>
            <p className="text-xs text-neutral-600 font-medium">
              Insira os dados gerados no hPanel da Hostinger. Na Hostinger, o host é sempre <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-bold">localhost</code>.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleTestAndSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Host */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Servidor MySQL (Host)
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs transition-all"
                  required
                />
                <span className="text-[10px] text-neutral-500 font-medium block">
                  Padrão Hostinger: localhost
                </span>
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Porta
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value, 10) || 3306)}
                  placeholder="3306"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs transition-all"
                />
                <span className="text-[10px] text-neutral-500 font-medium block">
                  Padrão: 3306
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome do Banco */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Nome do Banco de Dados
                </label>
                <input
                  type="text"
                  value={dbname}
                  onChange={(e) => setDbname(e.target.value)}
                  placeholder="Ex: u123456789_alx"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs transition-all"
                  required
                />
                <span className="text-[10px] text-neutral-500 font-medium block">
                  Nome completo criado no hPanel
                </span>
              </div>

              {/* Usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Usuário MySQL
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Ex: u123456789_admin"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs transition-all"
                  required
                />
                <span className="text-[10px] text-neutral-500 font-medium block">
                  Usuário com permissão no banco
                </span>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                Senha do Banco de Dados
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Senha definida na Hostinger"
                  className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-4 py-3 pr-11 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black shadow-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-neutral-500 font-medium block">
                As credenciais ficam salvas de forma segura no servidor da Hostinger em arquivo protegido contra acesso externo.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-black text-[#ebbf01] font-extrabold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#ebbf01]" />
                <span>{isSaving ? 'Conectando e Criando Tabelas...' : 'Salvar e Conectar MySQL'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncCurrentData}
                disabled={isSyncing}
                className="w-full sm:w-auto px-5 py-3.5 bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-md shadow-[#ebbf01]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Gravando no Servidor...' : 'Gravar Dados Atuais no Servidor (MySQL)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Step-by-Step Instructions Box (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 text-neutral-900 font-black text-sm">
              <HelpCircle className="w-4 h-4 text-[#ebbf01]" />
              <span>Como criar o banco na Hostinger:</span>
            </div>

            <ol className="space-y-3.5 text-xs text-neutral-600 font-medium list-decimal pl-4">
              <li>
                Acesse seu painel da <strong>Hostinger (hPanel)</strong>.
              </li>
              <li>
                No menu lateral, clique em <strong>Bancos de dados</strong> &rarr; <strong>Gerenciamento de Bancos de Dados</strong>.
              </li>
              <li>
                Em <strong>Criar Novo Banco de Dados MySQL</strong>, digite um nome (ex: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-bold">alx_db</code>), crie um usuário e uma senha segura.
              </li>
              <li>
                Clique em <strong>Criar</strong>. A Hostinger vai gerar o nome completo (ex: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-bold">u123456789_alx_db</code>).
              </li>
              <li>
                Copie o Nome do Banco, Usuário e Senha para os campos ao lado e clique em <strong>Salvar e Conectar MySQL</strong>.
              </li>
            </ol>

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-700 text-[11px] leading-relaxed">
              <strong>Vantagem permanente:</strong> O MySQL mantém todos os dados na Hostinger para sempre. Mesmo que você faça novos deploys de código via GitHub, nenhum dado será perdido!
            </div>
          </div>

          {/* Export SQL Box */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center border border-neutral-200">
              <HardDriveDownload className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-black text-neutral-900 font-heading">
                Importação Manual via phpMyAdmin
              </h5>
              <p className="text-xs text-neutral-600 font-medium">
                Prefere importar manualmente pelo phpMyAdmin? Baixe o script SQL completo com as tabelas e dados já prontos.
              </p>
            </div>
            <button
              onClick={handleDownloadSql}
              className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 border border-neutral-300 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-neutral-800" />
              <span>Baixar Script SQL (.sql)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
