import { EVModel, OTAUpdate } from '../types';

export const evModels: EVModel[] = [
  {
    id: 'byd-dolphin-mini',
    name: 'BYD Dolphin Mini',
    badge: 'Super Compacto • 75 cv',
    batteryCapacityKwh: 38.8,
    wltpRangeKm: 300,
    inmetroRangeKm: 280,
    maxDcChargingKw: 40,
    acChargingKw: 6.6,
    efficiencyKwh100km: 12.5,
    imageUrl: '/imagens/modelos/dolphin-gs.jpg',
    features: ['Bateria Blade 38.8 kWh', 'Ultra Leve', 'Tela 10.1" Rotativa', 'DiLink Otimizado']
  },
  {
    id: 'byd-dolphin-ev',
    name: 'BYD Dolphin GS',
    badge: 'Compacto Urbano • 95 cv',
    batteryCapacityKwh: 44.9,
    wltpRangeKm: 340,
    inmetroRangeKm: 291,
    maxDcChargingKw: 60,
    acChargingKw: 6.6,
    efficiencyKwh100km: 13.8,
    imageUrl: '/imagens/modelos/dolphin-gs.jpg',
    features: ['Bateria Blade 44.9 kWh', 'Excelente Consumo', 'Carregamento V2L', 'DiLink 12.8"']
  },
  {
    id: 'byd-dolphin-plus',
    name: 'BYD Dolphin Plus',
    badge: 'Hatch Esportivo • 204 cv',
    batteryCapacityKwh: 60.4,
    wltpRangeKm: 427,
    inmetroRangeKm: 330,
    maxDcChargingKw: 88,
    acChargingKw: 7,
    efficiencyKwh100km: 15.2,
    imageUrl: '/imagens/modelos/dolphin-plus.jpg',
    features: ['Bateria Blade 60.4 kWh', 'Teto Panorâmico', 'Multi-link traseiro', 'DiLink 3.0']
  },
  {
    id: 'byd-seal',
    name: 'BYD Seal AWD',
    badge: 'Flagship Sedan • 531 cv',
    batteryCapacityKwh: 82.5,
    wltpRangeKm: 520,
    inmetroRangeKm: 372,
    maxDcChargingKw: 150,
    acChargingKw: 11,
    efficiencyKwh100km: 17.5,
    imageUrl: '/imagens/modelos/seal-awd.jpg',
    features: ['Bateria Blade 82.5 kWh', 'Tração AWD', '0-100 km/h em 3.8s', 'DiLink 4.0 15.6" rotativa']
  },
  {
    id: 'byd-yuan-pro',
    name: 'BYD Yuan Pro / Plus',
    badge: 'SUV Elétrico • 177 cv',
    batteryCapacityKwh: 60.5,
    wltpRangeKm: 420,
    inmetroRangeKm: 294,
    maxDcChargingKw: 80,
    acChargingKw: 7,
    efficiencyKwh100km: 16.5,
    imageUrl: '/imagens/modelos/yuan-plus.jpg',
    features: ['Bateria Blade 60.5 kWh', 'Espaço SUV', 'Bomba de Calor Integrada', 'DiLink 4.0']
  },
  {
    id: 'byd-song-plus',
    name: 'BYD Song Plus DM-i',
    badge: 'Híbrido Plug-in • 235 cv',
    batteryCapacityKwh: 18.3,
    wltpRangeKm: 110,
    inmetroRangeKm: 68,
    maxDcChargingKw: 18,
    acChargingKw: 3.3,
    efficiencyKwh100km: 16.0,
    imageUrl: '/imagens/modelos/song-plus.jpg',
    features: ['Híbrido DM-i 18.3 kWh', 'Autonomia Combinada > 1000km', 'Modo EV Puro', 'DiLink 15.6"']
  },
  {
    id: 'byd-king-gs',
    name: 'BYD King GS',
    badge: 'Sedan Híbrido DM-i • 235 cv',
    batteryCapacityKwh: 18.3,
    wltpRangeKm: 120,
    inmetroRangeKm: 80,
    maxDcChargingKw: 18,
    acChargingKw: 3.3,
    efficiencyKwh100km: 14.5,
    imageUrl: '/imagens/modelos/king.jpg',
    features: ['Bateria Blade 18.3 kWh', 'Autonomia EV até 120km', 'Sedan Médio DM-i', 'DiLink 12.8" Rotativa']
  },
  {
    id: 'byd-king-gl',
    name: 'BYD King GL',
    badge: 'Sedan Híbrido DM-i • 209 cv',
    batteryCapacityKwh: 8.3,
    wltpRangeKm: 55,
    inmetroRangeKm: 36,
    maxDcChargingKw: 10,
    acChargingKw: 3.3,
    efficiencyKwh100km: 14.0,
    imageUrl: '/imagens/modelos/king.jpg',
    features: ['Bateria Blade 8.3 kWh', 'Consumo Otimizado', 'Autonomia Combinada 1175km', 'DiLink 12.8"']
  }
];

export const otaUpdatesList: OTAUpdate[] = [
  {
    id: 'ota-32',
    slug: 'ota-32',
    title: 'Atualização Oficial DiLink OTA 32',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Seal, Song Plus, Yuan Plus, Tan, Han',
    modelTarget: 'BYD Seal, Song Plus, Yuan Plus, Tan, Han',
    version: 'OTA 32',
    mcu: 'MCU 10.2.1-B',
    downloadUrl: 'https://drive.google.com',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Março 2026',
    downloadsCount: 38,
    status: 'Homologado ALX',
    size: '1.65 GB',
    changelog: [
      'Otimização do tempo de inicialização da central DiLink em 35%',
      'Adicionado suporte ao novo protocolo de áudio Hi-Fi ALX',
      'Aprimoramento da curva de recarga DC em estações de alta potência',
      'Correção do espelhamento de tela e novo layout de clima fluido'
    ],
    installationGuide: 'Descompacte o arquivo update.zip na raiz de um pen drive formatado em FAT32. Conecte na porta USB-A do console.'
  },
  {
    id: 'ota-31',
    slug: 'ota-31',
    title: 'Atualização Oficial DiLink OTA 31',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Dolphin GS, Dolphin Plus, Dolphin Mini',
    modelTarget: 'BYD Dolphin GS & Dolphin Mini',
    version: 'OTA 31',
    mcu: 'MCU 09.8.0',
    downloadUrl: 'https://mega.nz',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Janeiro 2026',
    downloadsCount: 29,
    status: 'Homologado ALX',
    size: '1.42 GB',
    changelog: [
      'Estabilidade aprimorada em conexões Bluetooth e Android Auto',
      'Desbloqueio de fontes de áudio de terceiros em segundo plano',
      'Menu rápido de controle de rotação de tela reformulado'
    ],
    installationGuide: 'Insira o pen drive USB na porta primária do veículo. A tela exibirá a notificação de firmware encontrado.'
  },
  {
    id: 'ota-30',
    slug: 'ota-30',
    title: 'Patch Oficial DiLink OTA 30',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Dolphin, Seal, Yuan Plus, Song Plus',
    modelTarget: 'BYD Dolphin, Seal, Yuan Plus, Song Plus',
    version: 'OTA 30',
    mcu: 'MCU 09.4.0',
    downloadUrl: 'https://mega.nz',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Novembro 2025',
    status: 'Estável',
    size: '1.18 GB',
    changelog: [
      'Atualização do kernel Android da central multimídia',
      'Compatibilidade com novos pacotes de idiomas e GPS offline',
      'Melhoria na precisão dos sensores de pressão de pneus TPMS'
    ],
    installationGuide: 'Copie a imagem de firmware para o pen drive e acesse Configurações do Veículo > Sistema > Atualização Local.'
  },
  {
    id: 'ota-29',
    slug: 'ota-29',
    title: 'Atualização Oficial DiLink OTA 29',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Dolphin, Dolphin Mini, Seal, Song Plus, Yuan Plus, Tan, Han',
    modelTarget: 'BYD Dolphin, Dolphin Mini, Seal, Song Plus, Yuan Plus, Tan, Han',
    version: 'OTA 29',
    mcu: 'MCU 09.1.2',
    downloadUrl: 'https://drive.google.com',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Setembro 2025',
    status: 'Estável',
    size: '1.35 GB',
    changelog: [
      'Melhoria na calibração de câmeras 360 e sensor de ponto cego',
      'Suporte a novos aplicativos de streaming e mapas DiLink',
      'Correções de latência na conexão do Apple CarPlay e Android Auto'
    ],
    installationGuide: 'Conecte o pen drive na porta USB-A do console e selecione Atualização Local no menu de configurações.'
  },
  {
    id: 'ota-28',
    slug: 'ota-28',
    title: 'Atualização Oficial DiLink OTA 28',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Seal, Song Plus, Yuan Plus, Dolphin GS',
    modelTarget: 'BYD Seal, Song Plus, Yuan Plus, Dolphin GS',
    version: 'OTA 28',
    mcu: 'MCU 08.9.0',
    downloadUrl: 'https://mega.nz',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Julho 2025',
    status: 'Estável',
    size: '1.20 GB',
    changelog: [
      'Nova interface visual para o painel de instrumentos do motorista',
      'Aprimoramento do algoritmo de climatização automática',
      'Correção do modo noturno e brilho da tela central'
    ],
    installationGuide: 'Copie os arquivos de firmware para o pen drive e acesse o menu de atualização.'
  },
  {
    id: 'ota-27',
    slug: 'ota-27',
    title: 'Patch Oficial DiLink OTA 27',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'BYD Dolphin, Dolphin Mini, Yuan Plus, Song Plus',
    modelTarget: 'BYD Dolphin, Dolphin Mini, Yuan Plus, Song Plus',
    version: 'OTA 27',
    mcu: 'MCU 08.5.1',
    downloadUrl: 'https://drive.google.com',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Maio 2025',
    status: 'Estável',
    size: '980 MB',
    changelog: [
      'Otimização de consumo energético dos módulos de entretenimento',
      'Suporte aprimorado ao assistente de voz Hi BYD',
      'Correções em reprodução de arquivos de áudio FLAC e MP3 via USB'
    ],
    installationGuide: 'Formate o pen drive em FAT32 e conecte na porta USB multimídia.'
  },
  {
    id: 'ota-soundpack-alx',
    slug: 'soundpack-alx-v3',
    title: 'ALX SoundEngine Pack v3.0',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
    applicableCars: 'Todos os modelos BYD (DiLink 3.0 e 4.0)',
    modelTarget: 'Todos os modelos BYD (DiLink 3.0 e 4.0)',
    version: 'SoundEngine v3.0',
    mcu: 'MCU Universal',
    downloadUrl: 'https://drive.google.com',
    tutorialUrl: '',
    tutorialId: '',
    releaseDate: 'Janeiro 2026',
    status: 'Homologado ALX',
    size: '340 MB',
    changelog: [
      'Equalizador paramétrico de 10 bandas exclusivo ALX',
      'Preset especial de graves profundos para sistemas de som Dynaudio e Dirac',
      'Normalização inteligente de volume entre rádio e apps'
    ],
    installationGuide: 'Instalação via APK disponível no painel ALX VIP.'
  }
];
