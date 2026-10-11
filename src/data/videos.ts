import { YouTubeVideo } from '../types';

/**
 * Lista de vídeos do YouTube.
 * Para adicionar ou trocar vídeos, basta alterar o 'youtubeId', 'title', 'description' e 'date'.
 * As thumbnails são geradas automaticamente através de `https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`
 * com fallback dinâmico para imagens de alta qualidade.
 */
export const youtubeVideos: YouTubeVideo[] = [
  {
    id: 'vid-vip-masterclass',
    youtubeId: 'AERBcFtpJz8',
    title: 'Masterclass: Desbloqueio e Instalação de APKs em Firmware Recente (2026)',
    description: 'Vídeo fechado de 42 minutos abordando procedimentos passo a passo sem risco de brick na multimídia.',
    date: 'Setembro, 2026',
    duration: '42:10',
    views: '1.2k visualizações VIP',
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
    category: 'Vídeo Exclusivo',
    isMembersOnly: true,
    isVipExclusive: true,
  },
  {
    id: 'vid-alx-1',
    youtubeId: 'AERBcFtpJz8',
    title: 'YouTube Perfeito para Multimídias Automotivas: Configuração & Dicas',
    description: 'Aprenda a configurar e utilizar a versão otimizada do YouTube para multimídias automotivas com suporte a controle no volante e excelente fluidez.',
    date: 'Setembro, 2026',
    duration: '10:15',
    views: '12.4k visualizações',
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
    category: 'Multimídia & Som'
  },
  {
    id: 'vid-alx-2',
    youtubeId: 'EDZ6lEtqIOg',
    title: '🔓 NOVO DESBLOQUEIO BYD | Funciona em Todas as Versões',
    description: 'Tutorial completo de desbloqueio de centrais multimídia BYD em todas as versões do sistema. Instale seus apps com total segurança.',
    date: 'Setembro, 2026',
    duration: '14:20',
    views: '28.1k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=EDZ6lEtqIOg',
    category: 'Tutoriais'
  },
  {
    id: 'vid-alx-3',
    youtubeId: 'RK3aLAMFf84',
    title: '🔐 Desbloqueio Denza B5 BYD - 2 Telas em movimento!',
    description: 'Demonstração e passo a passo para desbloqueio de vídeo em movimento em telas duplas na linha Denza B5 / BYD.',
    date: 'Agosto, 2026',
    duration: '11:45',
    views: '18.9k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=RK3aLAMFf84',
    category: 'Análise & Teste'
  },
  {
    id: 'vid-alx-4',
    youtubeId: 'doCYLi4lFJU',
    title: '⚡ Atualização OTA Multimídia BYD Versão 2606',
    description: 'Análise detalhada das melhorias da atualização OTA versão 2606 para multimídias automotivas da BYD.',
    date: 'Agosto, 2026',
    duration: '08:30',
    views: '15.2k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=doCYLi4lFJU',
    category: 'Atualizações & OTA'
  },
  {
    id: 'vid-alx-5',
    youtubeId: 'EDZ6lEtqIOg',
    title: 'Instalação de Apps Sem Fio na Central Multimídia BYD',
    description: 'Guia definitivo para instalar aplicativos na central multimídia BYD via Wi-Fi sem necessidade de pendrive.',
    date: 'Julho, 2026',
    duration: '09:40',
    views: '22.8k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=EDZ6lEtqIOg',
    category: 'Tutoriais'
  },
  {
    id: 'vid-alx-6',
    youtubeId: 'AERBcFtpJz8',
    title: 'Como Otimizar o Áudio e Equalização da Multimídia',
    description: 'Aprenda as melhores configurações de áudio e DSP para extrair o som máximo da sua central automotiva.',
    date: 'Julho, 2026',
    duration: '07:15',
    views: '11.3k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
    category: 'Multimídia & Som'
  },
  {
    id: 'vid-alx-7',
    youtubeId: 'RK3aLAMFf84',
    title: 'Waze e Google Maps em Tela Cheia no Painel Digital',
    description: 'Passo a passo para espelhar navegação GPS em alta definição aproveitando 100% da resolução da tela.',
    date: 'Junho, 2026',
    duration: '12:05',
    views: '19.7k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=RK3aLAMFf84',
    category: 'Tutoriais'
  },
  {
    id: 'vid-alx-8',
    youtubeId: 'doCYLi4lFJU',
    title: 'Novidades da Atualização de Firmware V2.4',
    description: 'Confira todas as correções de bugs, suporte a novos comandos e velocidade aprimorada no sistema.',
    date: 'Maio, 2026',
    duration: '10:50',
    views: '14.1k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=doCYLi4lFJU',
    category: 'Atualizações & OTA'
  },
  {
    id: 'vid-alx-9',
    youtubeId: 'AERBcFtpJz8',
    title: 'Top 5 Aplicativos Indispensáveis para Centrais Automotivas',
    description: 'Seleção dos melhores aplicativos de utilidade, streaming e gerenciamento para o seu carro elétrico ou híbrido.',
    date: 'Maio, 2026',
    duration: '15:10',
    views: '31.5k visualizações',
    isFeatured: false,
    videoUrl: 'https://www.youtube.com/watch?v=AERBcFtpJz8',
    category: 'Análise & Teste'
  }
];
