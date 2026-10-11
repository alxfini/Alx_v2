import { Tutorial } from '../types';

export const initialTutorials: Tutorial[] = [
  {
    id: 'tut-instalar-ota-usb',
    slug: 'como-instalar-atualizacao-ota-via-usb',
    title: 'Guia Definitivo: Como Instalar Atualização OTA via Pendrive USB nos Carros BYD',
    summary: 'Aprenda o passo a passo seguro para formatar seu pendrive, baixar a ROM oficial OTA e realizar o update na multimídia DiLink.',
    content: `## Requisitos Prévios
- Um pendrive USB 2.0 ou 3.0 de pelo menos 8 GB ou 16 GB.
- Formatação obrigatória no padrão **FAT32** ou **NTFS** (recomendado FAT32).
- Veículo estacionado em local seguro e bateria da multimídia acima de 30%.

## Passo 1: Preparação do Pendrive
1. Baixe o arquivo ZIP da atualização oficial do repositório ALX.
2. Certifique-se de descompactar o arquivo se necessário, mantendo a estrutura de pastas oficial (ex: arquivo \`update.zip\` na raiz).
3. Conecte o pendrive formatado e copie a pasta diretamente para a **raiz do pendrive** (não coloque dentro de subpastas).

![Formatação correta do pendrive USB em FAT32](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop)

## Passo 2: Instalação na Multimídia DiLink
1. Ligue o veículo em modo **OK** ou com a multimídia ligada.
2. Conecte o pendrive na **porta USB principal de dados** (normalmente a porta USB-A com ícone de dados no console frontal).
3. A central DiLink identificará automaticamente o arquivo de atualização em alguns segundos.
4. Clique em **Confirmar / Atualizar**. O sistema será reiniciado e iniciará o progresso de flash do firmware.

![Tela de atualização e progresso de instalação na central DiLink](https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop)

> **Atenção:** Não desligue o veículo e não remova o pendrive durante o processo (pode levar entre 8 a 20 minutos).`,
    category: 'Instalação OTA',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    author: 'Equipe ALX Tech',
    date: '15 de Março de 2026',
    readTime: '5 min de leitura',
    applicableCars: 'Dolphin, Dolphin Mini, Seal, Yuan Plus, Song Plus, King',
    tags: ['OTA', 'Firmware', 'BYD', 'DiLink', 'Tutorial'],
    isMembersOnly: true,
    isVipExclusive: true
  },
  {
    id: 'tut-instalar-apk-dilink',
    slug: 'como-instalar-aplicativos-apk-na-central-dilink',
    title: 'Como Instalar Aplicativos APK na Central DiLink com Segurança',
    summary: 'Passo a passo para habilitar fontes desconhecidas e instalar APKs como Waze, Spotify e YouTube diretamente na multimídia do seu elétrico.',
    content: `## Visão Geral
As centrais BYD DiLink rodam Android nativo. É possível instalar APKs compatíveis por pendrive ou pela loja ALX Apps.

![Gerenciador de aplicativos e central DiLink](https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop)

## Passo a Passo de Instalação
1. Baixe o APK desejado na seção **Apps** do portal ALX.
2. Salve o arquivo \`.apk\` em seu pendrive USB.
3. Insira o pendrive no carro e abra o Gerenciador de Arquivos do DiLink.
4. Localize o arquivo e toque para instalar. Habilite a permissão de instalação de fontes desconhecidas se solicitado.
5. Pronto! O app aparecerá no menu principal de aplicativos do carro.

> **Dica:** Para aplicativos de navegação como Waze, lembre-se de configurar a permissão de localização contínua nas configurações do Android.`,
    category: 'Aplicativos & APK',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop'
    ],
    author: 'Equipe ALX Tech',
    date: '10 de Março de 2026',
    readTime: '4 min de leitura',
    applicableCars: 'Todos os modelos BYD com DiLink',
    tags: ['APK', 'DiLink', 'Waze', 'Apps'],
    isMembersOnly: true,
    isVipExclusive: true
  }
];
