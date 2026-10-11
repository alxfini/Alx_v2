import { IptvPageConfig } from '../types';

export const initialIptvConfig: IptvPageConfig = {
  title: 'Sistema IPTV para seu veiculo, celular, sua casa!!!',
  summary: 'Aprenda a configurar transmissão de TV ao vivo, esportes e canais na sua central multimídia automotiva, celular e smart TV.',
  guideContent: `### Como Configurar IPTV na Multimídia Automotiva (BYD, Android Auto e AI Box)

#### Passo 1: Instalação do Aplicativo Leitor
Baixe um dos leitores recomendados abaixo (exemplo: **XCIPTV Player** ou **IPTV Smarters Pro**). Transfira o arquivo APK baixado para um pendrive e conecte na entrada USB principal do veículo ou utilize o aplicativo **Downloader** direto pelo navegador da multimídia.

#### Passo 2: Permissões de Fontes Desconhecidas
Acesse as **Configurações do Android** na multimídia ➔ **Segurança / Aplicativos** ➔ **Permitir Instalação de Fontes Desconhecidas** no seu gerenciador de arquivos.

#### Passo 3: Inserção de Dados do Servidor
Abra o aplicativo instalado e selecione a opção **Xtream Codes API** ou **Lista M3U**:
- **Servidor / URL**: Insira o endereço HTTP fornecido pelo seu provedor IPTV
- **Usuário & Senha**: Preencha suas credenciais de acesso
- Clique em **Entrar / Entrar na Lista**

#### Passo 4: Otimização do Player para Veículos
Nas configurações do player escolhido:
1. Altere o Decodificador de Vídeo para **HW (Hardware)** para usar o processador de vídeo nativo da tela.
2. Defina o tamanho do Buffer para **2 ou 3 segundos** para suavizar flutuações do sinal 4G/5G durante o trajeto.
3. Desative a pré-visualização em miniatura se a central tiver 2GB de RAM ou menos para economizar memória.`,
  youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
  apps: [
    {
      id: 'xciptv',
      name: 'XCIPTV Player HD',
      version: 'v6.0.2',
      category: 'Player XTREAM / M3U',
      description: 'Interface rápida e otimizada para telas touch e centrais multimídia BYD. Suporta EPG, Canais VOD e Séries.',
      downloadUrl: 'https://alx.com.br/downloads/xciptv-v6.apk',
      badge: 'Recomendado BYD',
      fileSize: '45 MB',
    },
    {
      id: 'smarters-pro',
      name: 'IPTV Smarters Pro',
      version: 'v4.0.1',
      category: 'Player Multi-Tela',
      description: 'Player clássico e robusto com suporte a múltiplas listas, guia de programação EPG e controle parental.',
      downloadUrl: 'https://alx.com.br/downloads/smarters-v4.apk',
      badge: 'Popular',
      fileSize: '38 MB',
    },
    {
      id: 'tivimate',
      name: 'TiviMate IPTV Companion',
      version: 'v4.7.0',
      category: 'Interface Premium',
      description: 'O melhor layout estilo TV a cabo com troca rápida de canais e excelente desempenho em Android Auto / AI Box.',
      downloadUrl: 'https://alx.com.br/downloads/tivimate-v4.apk',
      badge: 'Interface Premium',
      fileSize: '28 MB',
    },
    {
      id: 'ss-iptv',
      name: 'SS IPTV Automotivo',
      version: 'v2.1',
      category: 'Player Leve',
      description: 'Versão extremamente leve e estável para multimídias com memória RAM limitada ou sistemas mais antigos.',
      downloadUrl: 'https://alx.com.br/downloads/ssiptv-auto.apk',
      badge: 'Leve & Rápido',
      fileSize: '18 MB',
    },
    {
      id: 'downloader-byd',
      name: 'Downloader BYD Direct',
      version: 'v1.4.2',
      category: 'Utilitário de Downloads',
      description: 'Facilita baixar qualquer arquivo APK diretamente do navegador da multimídia sem necessitar de pendrive.',
      downloadUrl: 'https://alx.com.br/downloads/downloader-byd.apk',
      badge: 'Essencial',
      fileSize: '12 MB',
    },
    {
      id: 'perfect-player',
      name: 'Perfect Player IPTV',
      version: 'v1.6.0',
      category: 'Player de Alta Definição',
      description: 'Reprodutor com suporte a codecs avançados e otimizado para reprodução contínua em viagens.',
      downloadUrl: 'https://alx.com.br/downloads/perfect-player.apk',
      badge: 'Codec HD',
      fileSize: '22 MB',
    },
  ],
  links: [
    {
      id: 'webplayer',
      title: 'Web Player IPTV (Assistir no Browser)',
      description: 'Acesse o leitor de canais via navegador sem precisar instalar aplicativos na central.',
      url: 'https://web.iptv-smarters.com',
      badge: 'Sem Instalação',
      isExternal: true,
    },
    {
      id: 'speedtest',
      title: 'Teste de Velocidade de Conexão',
      description: 'Verifique a taxa de download do seu chip 4G/5G ou Wi-Fi na central multimídia.',
      url: 'https://fast.com',
      badge: 'Diagnóstico',
      isExternal: true,
    },
    {
      id: 'tutorial-video',
      title: 'Vídeo Tutorial no YouTube',
      description: 'Assista ao passo a passo de configuração e instalação do IPTV na multimídia BYD.',
      url: '/youtube',
      badge: 'Vídeo',
      isExternal: false,
    },
    {
      id: 'suporte-telegram',
      title: 'Grupo de Suporte no Telegram',
      description: 'Tire dúvidas sobre listas, DNS e aplicativos com a comunidade ALX no Telegram.',
      url: 'https://t.me/ALX_Comunidade',
      badge: 'Comunidade',
      isExternal: true,
    },
  ],
};
