import { VipBenefit, VipContentItem, VipUser } from '../types';

export const vipBenefits: VipBenefit[] = [
  {
    id: 'b1',
    title: 'Aplicativos Exclusivos',
    description: 'Acesso prioritário a launchers customizados, módulos de telemetria e ferramentas desenvolvidas sob medida.',
    icon: 'Smartphone'
  },
  {
    id: 'b2',
    title: 'Downloads Diretos de APKs & Tools',
    description: 'Servidores de download de alta velocidade, sem propagandas, sem encurtadores e com verificação de integridade SHA-256.',
    icon: 'Download'
  },
  {
    id: 'b3',
    title: 'Conteúdos e Builds Antecipados',
    description: 'Receba novas versões beta, testes de multimídias e novidades antes de qualquer divulgação no canal público.',
    icon: 'Zap'
  },
  {
    id: 'b4',
    title: 'Tutoriais e Guias Avançados',
    description: 'Passo a passo detalhado de modificações, desbloqueio de centrais e configuração de periféricos com segurança.',
    icon: 'BookOpen'
  },
  {
    id: 'b5',
    title: 'Materiais & Arquivos de Configuração',
    description: 'Presets prontos para equalizadores, arquivos de layout XML e scripts de automação veicular.',
    icon: 'Layers'
  },
  {
    id: 'b6',
    title: 'Comunidade VIP Exclusiva',
    description: 'Comunidade fechada de membros para troca de experiências e novidades de multimídia.',
    icon: 'ShieldCheck'
  }
];

export const vipExclusiveItems: VipContentItem[] = [];

export const demoVipUser: VipUser = {
  name: 'Alexandre Rodrigo',
  email: 'membro@alxtech.com.br',
  tier: 'Assinante Oficial',
  memberSince: 'Agosto 2025'
};

export const initialVipMembers = [
  {
    id: 'vip-m-1',
    name: 'Carlos Eduardo Silva',
    email: 'carlos.eduardo@gmail.com',
    phone: '(11) 98765-4321',
    password: 'membro123',
    planType: 'Assinante VIP',
    period: 'Anual',
    startDate: '2026-01-15',
    expirationDate: '2027-01-15',
    status: 'Ativo',
    notes: 'Apoiador ativo do portal com licença anual.',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'vip-m-2',
    name: 'Luciana Martins Mendes',
    email: 'luciana.mendes@hotmail.com',
    phone: '(21) 99887-1122',
    password: 'membro123',
    planType: 'Apoiador Comunidade',
    period: 'Mensal',
    startDate: '2026-09-01',
    expirationDate: '2026-10-05',
    status: 'Expirando em Breve',
    notes: 'Adesão realizada via Comunidade Telegram.',
    createdAt: '2026-09-01T14:30:00.000Z',
  },
  {
    id: 'vip-m-3',
    name: 'Roberto Fernando Santos',
    email: 'roberto.santos@yahoo.com.br',
    phone: '(41) 97123-8899',
    password: 'membro123',
    planType: 'Membro YouTube',
    period: 'Mensal',
    startDate: '2026-07-10',
    expirationDate: '2026-09-28',
    status: 'Expirado',
    notes: 'Selo de membro no YouTube.',
    createdAt: '2026-07-10T11:20:00.000Z',
  },
  {
    id: 'vip-m-4',
    name: 'Alexandre Rodrigo',
    email: 'alxrdrgo@gmail.com',
    phone: '(51) 99999-9999',
    password: 'alx2026',
    planType: 'Vitalício',
    period: 'Vitalício',
    startDate: '2025-05-01',
    expirationDate: 'Vitalício',
    status: 'Ativo',
    notes: 'Membro Fundador do Portal ALX.',
    createdAt: '2025-05-01T08:00:00.000Z',
  },
];
