import { ALXApp } from '../types';

/**
 * Catálogo de Aplicativos desenvolvidos pela ALX.
 * Estrutura preparada para cadastrar novos apps, screenshots, requisitos e links de download/compra.
 */
export const alxApps: ALXApp[] = [
  {
    id: 'app-aurora-byd',
    slug: 'aurora-byd',
    name: 'Aurora BYD',
    tagline: 'Interface moderna e fluida otimizada para centrais multimídia BYD',
    description: 'Um inicializador customizado (Launcher) desenvolvido para proporcionar controle rápido de mídia, atalhos dinâmicos e perfeita adaptação a telas horizontais e verticais.',
    fullDescription: 'O Aurora BYD foi concebido para transformar a usabilidade da sua central multimídia. Com arquitetura leve e consumo mínimo de memória RAM, ele oferece atalhos para os principais aplicativos do seu dia a dia, widget de velocidade baseado em GPS e integração visual impecável com o painel do seu veículo elétrico.',
    coverImage: '/imagens/apps/byd-cockpit.jpg',
    screenshots: [
      '/imagens/apps/byd-cockpit.jpg',
      '/imagens/noticias/noticia-2.jpg',
      '/imagens/noticias/noticia-1.jpg'
    ],
    features: [
      'Suporte nativo a rotação de tela (Modo Retrato e Paisagem)',
      'Controle rápido de brilho, volume e atalhos favoritos',
      'Velocímetro digital integrado com alerta sonoro configurável',
      'Design escuro AMOLED com detalhes em alto contraste',
      'Inicialização rápida e consumo ultrabaixo de bateria de 12V'
    ],
    compatibility: [
      'BYD Dolphin & Dolphin Mini (EV)',
      'BYD Seal & Seal U',
      'BYD Yuan Plus / Song Plus',
      'Centrais Android 9.0 ou superior'
    ],
    requirements: [
      'Sistema Android 9.0 ou superior',
      'Mínimo de 2GB de memória RAM livre',
      'Permissão de sobreposição de tela e localização (GPS)'
    ],
    version: 'v2.4.1 (Estável)',
    priceText: 'R$ 49,90',
    isFree: false,
    buyUrl: '#comprar-aurora',
    downloadUrl: '#download-aurora',
    badge: 'Mais Popular',
    isVipExclusive: false,
    category: 'Launchers & Sistema',
    downloadsCount: 15420,
    isUpdated: true
  },
  {
    id: 'app-ytmusic-alx',
    slug: 'youtube-music-alx',
    name: 'YouTube Music ALX',
    tagline: 'Versão adaptada para uso seguro e confortável no volante',
    description: 'Reprodutor multimídia personalizado com botões ampliados, controles mapeáveis nos botões do volante e carregamento rápido sem distrações visuais.',
    fullDescription: 'Desenvolvido especialmente para centrais automotivas onde a interface original de smartphone é difícil de operar durante a condução. O YouTube Music ALX oferece botões de fácil alcance, busca por voz precisa e compatibilidade com equalizadores DSP de alta resolução.',
    coverImage: '/imagens/apps/car-launcher.jpg',
    screenshots: [
      '/imagens/apps/car-launcher.jpg',
      '/imagens/noticias/noticia-2.jpg'
    ],
    features: [
      'Interface simplificada com foco em segurança na direção',
      'Mapeamento dos botões de avançar/voltar no volante do carro',
      'Modo escuro com paleta de cores de baixa luminosidade noturna',
      'Cache inteligente para reprodução contínua em túneis e rodovias',
      'Zero anúncios intrusivos ou pop-ups'
    ],
    compatibility: [
      'Todas as centrais Android automotivas',
      'Sistemas BYD DiLink',
      'Centrais multimídia universais Android'
    ],
    requirements: [
      'Android 8.0 ou superior',
      'Conexão com internet (Wi-Fi do carro ou 4G roteado)'
    ],
    version: 'v1.8.0',
    priceText: 'Gratuito',
    isFree: true,
    buyUrl: '#',
    downloadUrl: '#download-ytmusic',
    badge: 'Gratuito',
    isVipExclusive: false,
    category: 'Música & Áudio',
    downloadsCount: 22890
  },
  {
    id: 'app-telemetria-hub',
    slug: 'alx-telemetria-hub',
    name: 'ALX Telemetria & Hub',
    tagline: 'Monitoramento em tempo real de bateria, temperatura e eficiência',
    description: 'Ferramenta avançada para leitura de parâmetros OBD2, estimativa precisa de autonomia, curvas de recarga e histórico de viagens em veículos elétricos e híbridos.',
    fullDescription: 'O ALX Telemetria & Hub conecta-se via Bluetooth com os principais scanners OBD2 do mercado para fornecer um painel de instrumentos em tempo real diretamente na tela da sua multimídia. Visualize a voltagem de cada bloco de baterias, State of Health (SoH) e consumo em kWh/100km com gráficos dinâmicos.',
    coverImage: '/imagens/apps/media-player.jpg',
    screenshots: [
      '/imagens/apps/media-player.jpg',
      '/imagens/noticias/noticia-1.jpg'
    ],
    features: [
      'Leitura de SoH (Saúde da bateria) e temperatura de células',
      'Painel HUD personalizável com medidores digitais e analógicos',
      'Exportação de logs de telemetria em formato CSV/JSON',
      'Alertas de limite de temperatura e sobretensão em recarga rápida',
      'Modo pista e medição de aceleração 0-100 km/h com GPS'
    ],
    compatibility: [
      'Adaptadores OBD2 Bluetooth v4.0 / BLE / Wi-Fi',
      'Modelos BYD, GWM Ora/Haval, Geely, Volvo e universais'
    ],
    requirements: [
      'Scanner OBD2 BLE compatível',
      'Bluetooth ativado na multimídia'
    ],
    version: 'v3.1.0 Beta',
    priceText: 'Exclusivo VIP',
    isFree: false,
    buyUrl: '#vip',
    downloadUrl: '#vip',
    badge: 'Novo / VIP',
    isVipExclusive: true,
    category: 'Diagnóstico & Telemetria',
    downloadsCount: 8940
  }
];
