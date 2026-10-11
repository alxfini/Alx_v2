import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';

async function deploy() {
  const server = process.env.FTP_SERVER || '';
  const username = process.env.FTP_USERNAME || '';
  const password = process.env.FTP_PASSWORD || '';
  const port = process.env.FTP_PORT ? parseInt(process.env.FTP_PORT, 10) : 21;

  if (!server || !username || !password) {
    console.error('❌ Erro: As credenciais FTP (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD) não foram encontradas nas variáveis de ambiente.');
    process.exit(1);
  }

  // Limpa o host (remove protocolo ftp:// ou ftps:// se houver)
  const cleanHost = server.replace(/^ftps?:\/\//i, '').replace(/\/.*$/, '').trim();

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log(`🔌 Conectando ao servidor FTP: ${cleanHost}...`);
    await client.access({
      host: cleanHost,
      user: username,
      password: password,
      port: port,
      secure: false, // Suporta FTP padrão da Hostinger
    });

    console.log('✅ Conexão estabelecida com sucesso!');

    // 1. Garantir que as pastas principais existam antes de qualquer upload
    console.log('📁 Verificando e criando pastas necessárias na Hostinger...');
    await client.ensureDir('assets');
    await client.cd('..');
    await client.ensureDir('api');
    await client.cd('..');
    await client.ensureDir('imagens');
    await client.cd('..');
    await client.ensureDir('uploads');
    await client.cd('..');

    // 2. Se houver um arquivo de estado antigo corrompido do FTP-Deploy-Action (.ftp-deploy-sync-state.json), remove
    try {
      await client.remove('.ftp-deploy-sync-state.json');
      console.log('🧹 Limpo arquivo de cache .ftp-deploy-sync-state.json antigo do servidor.');
    } catch {
      // Ignora se não existir
    }

    // 3. Fazer o upload de todos os arquivos de dist/ preservando dados e uploads
    console.log('🚀 Iniciando envio dos arquivos de produção (dist/)...');
    
    // Obter lista de arquivos locais em dist/assets para limpeza de hashes antigos
    const localDist = path.resolve('dist');
    const localAssets = fs.existsSync(path.join(localDist, 'assets')) 
      ? fs.readdirSync(path.join(localDist, 'assets')) 
      : [];

    // Limpar assets antigos com hash diferente no servidor para economizar espaço
    try {
      console.log('🧹 Verificando arquivos antigos na pasta assets...');
      await client.cd('assets');
      const remoteAssets = await client.list();
      for (const item of remoteAssets) {
        if (item.isFile && (item.name.endsWith('.js') || item.name.endsWith('.css') || item.name.endsWith('.map'))) {
          if (!localAssets.includes(item.name)) {
            console.log(`   Removendo versão antiga: assets/${item.name}`);
            await client.remove(item.name).catch(() => {});
          }
        }
      }
      await client.cd('..');
    } catch (e) {
      console.warn('   Aviso na limpeza de assets antigos:', e.message);
      await client.cd('/').catch(() => {});
    }

    // Upload seguro da pasta dist para o servidor
    // basic-ftp cria automaticamente qualquer subdiretório antes de enviar o arquivo
        // Protege configurações e dados do servidor para que o deploy FTP nunca os sobrescreva
    const filesToProtect = [
      path.join(localDist, 'api', 'db-config.php'),
      path.join(localDist, 'api', 'site-data.json'),
      path.join(localDist, 'api', 'site-data-backup.json'),
      path.join(localDist, 'site-data.json'),
      path.join(localDist, 'site-data-backup.json'),
    ];
    for (const f of filesToProtect) {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch {}
      }
    }

    await client.uploadFromDir(localDist, '.');

    console.log('✨ Deploy concluído com sucesso total na Hostinger!');
  } catch (err) {
    console.error('❌ Falha durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
