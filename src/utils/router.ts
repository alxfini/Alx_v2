import { 
  ActivePageView, 
  ALXApp, 
  NewsArticle, 
  ProductItem, 
  OTAUpdate, 
  Tutorial, 
  UnlockServiceItem, 
  WallpaperItem 
} from '../types';

export interface TitleStoreData {
  apps?: ALXApp[];
  news?: NewsArticle[];
  products?: ProductItem[];
  otaUpdates?: OTAUpdate[];
  tutorials?: Tutorial[];
  unlockServices?: UnlockServiceItem[];
  wallpapers?: WallpaperItem[];
}

/**
 * Converts an ActivePageView object into a clean URL pathname
 */
export function getRoutePath(page: ActivePageView): string {
  switch (page.type) {
    case 'home':
      return '/';
    case 'calculadora':
      return '/calculadora';
    case 'radar-ota':
      return '/ota';
    case 'ota':
      return page.idOrSlug ? `/ota/${encodeURIComponent(page.idOrSlug)}` : '/ota';
    case 'tutoriais':
      return '/tutoriais';
    case 'tutorial':
      return page.idOrSlug ? `/tutoriais/${encodeURIComponent(page.idOrSlug)}` : '/tutoriais';
    case 'desbloqueio':
      return '/desbloqueio';
    case 'servico-desbloqueio':
      return page.idOrSlug ? `/desbloqueio/${encodeURIComponent(page.idOrSlug)}` : '/desbloqueio';
    case 'apps':
      return '/apps';
    case 'app':
      return page.idOrSlug ? `/apps/${encodeURIComponent(page.idOrSlug)}` : '/apps';
    case 'wallpapers':
      return '/wallpapers';
    case 'wallpaper':
      return page.idOrSlug ? `/wallpapers/${encodeURIComponent(page.idOrSlug)}` : '/wallpapers';
    case 'iptv':
      return '/iptv';
    case 'youtube':
      return '/youtube';
    case 'noticias':
      return '/noticias';
    case 'news':
      return page.idOrSlug ? `/noticias/${encodeURIComponent(page.idOrSlug)}` : '/noticias';
    case 'vip':
      return '/vip';
    case 'produtos':
      return '/produtos';
    case 'shop':
      return '/shop';
    case 'product':
      return page.idOrSlug ? `/produtos/${encodeURIComponent(page.idOrSlug)}` : '/produtos';
    case 'gerador-imei':
    case 'imei':
      return '/imei';
    case 'sobre':
      return '/sobre';
    case 'termos':
      return '/termos';
    case 'privacidade':
      return '/privacidade';
    case 'contato':
      return '/contato';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

/**
 * Parses a pathname/hash into an ActivePageView object
 */
export function getPageFromUrl(pathname: string = window.location.pathname, hash: string = window.location.hash): ActivePageView {
  // Strip queries and hashes first
  let raw = pathname.split('?')[0].split('#')[0];
  let clean = raw.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  
  // If pathname is root or empty, check hash
  if (!clean && hash) {
    const rawHash = hash.split('?')[0];
    clean = rawHash.trim().toLowerCase().replace(/^[#/]+|[#/]+$/g, '');
  }

  // Handle case where a duplicated URL was opened (e.g. /desbloqueio/slughttps://domain.com/...)
  if (clean.includes('http://') || clean.includes('https://')) {
    clean = clean.split(/https?:\/\//)[0].replace(/\/+$/, '');
  }

  if (!clean) {
    return { type: 'home' };
  }

  const parts = clean.split('/').filter(Boolean);
  const rootSegment = parts[0];
  const subSegment = parts[1] ? decodeURIComponent(parts[1]) : undefined;

  switch (rootSegment) {
    case 'calculadora':
    case 'calculator':
    case 'simulador':
      return { type: 'calculadora' };

    case 'ota':
    case 'radar-ota':
    case 'firmware':
    case 'atualizacoes':
    case 'atualizacao':
      if (subSegment) {
        return { type: 'ota', idOrSlug: subSegment };
      }
      return { type: 'radar-ota' };

    case 'tutoriais':
    case 'tutorial':
    case 'guias':
    case 'guia':
      if (subSegment) {
        return { type: 'tutorial', idOrSlug: subSegment };
      }
      return { type: 'tutoriais' };

    case 'desbloqueio':
    case 'desbloqueios':
    case 'desbloquear':
    case 'unlock':
    case 'servicos':
    case 'servico':
      if (subSegment) {
        return { type: 'servico-desbloqueio', idOrSlug: subSegment };
      }
      return { type: 'desbloqueio' };

    case 'apps':
    case 'app':
    case 'loja':
    case 'store':
      if (subSegment) {
        return { type: 'app', idOrSlug: subSegment };
      }
      return { type: 'apps' };

    case 'wallpapers':
    case 'wallpaper':
    case 'papeldeparede':
    case 'fundodetela':
      if (subSegment) {
        return { type: 'wallpaper', idOrSlug: subSegment };
      }
      return { type: 'wallpapers' };

    case 'iptv':
    case 'iptv-player':
    case 'tv-online':
      return { type: 'iptv' };

    case 'youtube':
    case 'videos':
    case 'video':
    case 'canal':
      return { type: 'youtube' };

    case 'noticias':
    case 'noticia':
    case 'news':
    case 'artigos':
    case 'blog':
      if (subSegment) {
        return { type: 'news', idOrSlug: subSegment };
      }
      return { type: 'noticias' };

    case 'comunidade':
    case 'telegram':
    case 'grupo':
      return { type: 'home' };

    case 'vip':
    case 'area-vip':
    case 'membros':
      return { type: 'vip' };

    case 'produtos':
    case 'produto':
    case 'loja-produtos':
    case 'acessorios':
    case 'shop':
      if (subSegment) {
        return { type: 'product', idOrSlug: subSegment };
      }
      return { type: 'shop' };

    case 'imei':
    case 'gerador-imei':
    case 'byd-imei':
    case 'senha-imei':
      return { type: 'gerador-imei' };

    case 'sobre':
    case 'sobre-nos':
    case 'about':
      return { type: 'sobre' };

    case 'termos':
    case 'termos-de-uso':
    case 'terms':
      return { type: 'termos' };

    case 'privacidade':
    case 'politica-de-privacidade':
    case 'privacy':
      return { type: 'privacidade' };

    case 'contato':
    case 'fale-conosco':
    case 'contact':
      return { type: 'contato' };

    case 'admin':
    case 'painel':
    case 'dashboard':
      return { type: 'admin' };

    case '404':
    case 'notfound':
    case 'erro-404':
    default:
      return { type: 'home' };
  }
}

/**
 * Generates exact page title according to brand and route specifications
 */
export function getPageTitle(
  page: ActivePageView,
  brandName: string = 'Alx⁺',
  storeData?: TitleStoreData
): string {
  const brand = brandName || 'Alx⁺';

  switch (page.type) {
    case 'home':
      return brand;

    case 'desbloqueio':
      return `${brand} - Desbloqueio`;

    case 'servico-desbloqueio': {
      if (page.idOrSlug && storeData?.unlockServices) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const item = storeData.unlockServices.find(
          s => s.id === page.idOrSlug || s.slug === page.idOrSlug || s.id.toLowerCase() === idOrSlugLower || (s.slug && s.slug.toLowerCase() === idOrSlugLower)
        );
        if (item?.title) {
          return `${brand} - ${item.title}`;
        }
      }
      return `${brand} - Desbloqueio`;
    }

    case 'apps':
      return `${brand} - Apps`;

    case 'app': {
      if (page.idOrSlug && storeData?.apps) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const app = storeData.apps.find(
          a => a.id === page.idOrSlug || a.slug === page.idOrSlug || a.id.toLowerCase() === idOrSlugLower || (a.slug && a.slug.toLowerCase() === idOrSlugLower)
        );
        if (app?.name) {
          return `${brand} - ${app.name}`;
        }
      }
      return `${brand} - Apps`;
    }

    case 'wallpapers':
      return `${brand} - Wallpapers Animados`;

    case 'wallpaper': {
      if (page.idOrSlug && storeData?.wallpapers) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const w = storeData.wallpapers.find(
          item => item.id === page.idOrSlug || item.slug === page.idOrSlug || item.id.toLowerCase() === idOrSlugLower || (item.slug && item.slug.toLowerCase() === idOrSlugLower)
        );
        if (w?.title) {
          return `${brand} - ${w.title}`;
        }
      }
      return `${brand} - Wallpapers Animados`;
    }

    case 'radar-ota':
      return `${brand} - Radar OTA`;

    case 'ota': {
      if (page.idOrSlug && storeData?.otaUpdates) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const ota = storeData.otaUpdates.find(
          o => o.id === page.idOrSlug || o.slug === page.idOrSlug || o.id.toLowerCase() === idOrSlugLower || (o.slug && o.slug.toLowerCase() === idOrSlugLower)
        );
        if (ota) {
          const otaName = ota.title || (ota.applicableCars ? `${ota.applicableCars} (${ota.version})` : `OTA ${ota.version}`);
          return `${brand} - ${otaName}`;
        }
      }
      return `${brand} - Radar OTA`;
    }

    case 'tutoriais':
      return `${brand} - Tutoriais`;

    case 'tutorial': {
      if (page.idOrSlug && storeData?.tutorials) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const tut = storeData.tutorials.find(
          t => t.id === page.idOrSlug || t.slug === page.idOrSlug || t.id.toLowerCase() === idOrSlugLower || (t.slug && t.slug.toLowerCase() === idOrSlugLower)
        );
        if (tut?.title) {
          return `${brand} - ${tut.title}`;
        }
      }
      return `${brand} - Tutoriais`;
    }

    case 'iptv':
      return `${brand} - IPTV`;

    case 'youtube':
      return `${brand} - Vídeos`;

    case 'noticias':
      return `${brand} - Notícias`;

    case 'news': {
      if (page.idOrSlug && storeData?.news) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const n = storeData.news.find(
          article => article.id === page.idOrSlug || article.slug === page.idOrSlug || article.id.toLowerCase() === idOrSlugLower || (article.slug && article.slug.toLowerCase() === idOrSlugLower)
        );
        if (n?.title) {
          return `${brand} - ${n.title}`;
        }
      }
      return `${brand} - Notícias`;
    }

    case 'vip':
      return `${brand} - Área VIP`;

    case 'produtos':
    case 'shop':
      return `${brand} - Produtos`;

    case 'product': {
      if (page.idOrSlug && storeData?.products) {
        const idOrSlugLower = decodeURIComponent(page.idOrSlug).toLowerCase();
        const p = storeData.products.find(
          prod => prod.id === page.idOrSlug || prod.slug === page.idOrSlug || prod.id.toLowerCase() === idOrSlugLower || (prod.slug && prod.slug.toLowerCase() === idOrSlugLower)
        );
        if (p?.name) {
          return `${brand} - ${p.name}`;
        }
      }
      return `${brand} - Produtos`;
    }

    case 'calculadora':
      return `${brand} - Calculadora`;

    case 'gerador-imei':
    case 'imei':
      return `${brand} - Gerador IMEI`;

    case 'sobre':
      return `${brand} - Sobre`;

    case 'termos':
      return `${brand} - Termos de Uso`;

    case 'privacidade':
      return `${brand} - Política de Privacidade`;

    case 'contato':
      return `${brand} - Contato`;

    case 'admin':
      return `${brand} - Admin`;

    case 'comunidade':
      return `${brand} - Comunidade VIP`;

    default:
      return brand;
  }
}

/**
 * Updates document.title and OpenGraph meta tags based on active page
 */
export function updateDocumentTitle(
  page: ActivePageView,
  brandName: string = 'Alx⁺',
  customDefaultImage?: string,
  storeData?: TitleStoreData
) {
  const pageTitle = getPageTitle(page, brandName, storeData);
  let pageDesc = 'Portal oficial — OTA Firmware BYD, Loja de Aplicativos, Calculadora de Autonomia e Vídeos.';

  switch (page.type) {
    case 'calculadora':
      pageDesc = 'Simule autonomia, consumo energético e custos de recarga para carros elétricos.';
      break;
    case 'radar-ota':
    case 'ota':
      pageDesc = 'Radar de versões de firmware e atualizações oficiais para centrais multimídia BYD.';
      break;
    case 'tutoriais':
    case 'tutorial':
      pageDesc = 'Guias passo a passo para instalação de aplicativos e atualizações do sistema.';
      break;
    case 'desbloqueio':
    case 'servico-desbloqueio':
      pageDesc = 'Serviços especializados de desbloqueio de multimídia, instalação de APKs, suporte remoto e customizações.';
      break;
    case 'apps':
    case 'app':
      pageDesc = 'Aplicativos testados e otimizados para centrais multimídia automotivas.';
      break;
    case 'wallpapers':
    case 'wallpaper':
      pageDesc = 'Baixe papéis de parede em 4K e papéis de parede animados para personalização de multimídias automotivas.';
      break;
    case 'iptv':
      pageDesc = 'Baixe reprodutores de IPTV otimizados e confira tutoriais passo a passo para multimídia automotiva.';
      break;
    case 'youtube':
      pageDesc = 'Acompanhe os últimos vídeos, análises e tutoriais em vídeo.';
      break;
    case 'noticias':
    case 'news':
      pageDesc = 'Últimas notícias sobre mobilidade elétrica e tecnologia automotiva.';
      break;
    case 'vip':
      pageDesc = 'Downloads prioritários e conteúdos exclusivos para assinantes VIP.';
      break;
    case 'produtos':
    case 'product':
    case 'shop':
      pageDesc = 'Acessórios homologados, adaptadores streaming e cabos de recarga.';
      break;
    case 'gerador-imei':
    case 'imei':
      pageDesc = 'Ferramenta de geração de senha de engenharia para centrais multimídia BYD DiLink.';
      break;
    case 'sobre':
      pageDesc = 'Saiba mais sobre a plataforma independente de tecnologia automotiva ALX.';
      break;
    case 'termos':
      pageDesc = 'Termos de uso, isenção de responsabilidade técnica e diretrizes da plataforma independente Alx⁺.';
      break;
    case 'privacidade':
      pageDesc = 'Diretrizes de privacidade, proteção de dados e conformidade com a LGPD da plataforma Alx⁺.';
      break;
    case 'contato':
      pageDesc = 'Entre em contato com a equipe da plataforma ALX por e-mail, WhatsApp ou formulário.';
      break;
    case 'admin':
      pageDesc = 'Painel Administrativo da plataforma Alx⁺.';
      break;
    case 'home':
    default:
      break;
  }

  document.title = pageTitle;

  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) {
    descMeta.setAttribute('content', pageDesc);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', pageTitle);
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', pageDesc);
  }

  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) {
    twTitle.setAttribute('content', pageTitle);
  }

  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) {
    twDesc.setAttribute('content', pageDesc);
  }

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && typeof window !== 'undefined') {
    ogUrl.setAttribute('content', window.location.origin + window.location.pathname);
  }

  // Dynamic OpenGraph / Social Share Card Image
  let pageImage = customDefaultImage || '/imagens/og-padrao.jpg';
  switch (page.type) {
    case 'iptv':
      pageImage = '/imagens/og-iptv.jpg';
      break;
    case 'desbloqueio':
    case 'servico-desbloqueio':
      pageImage = '/imagens/og-desbloqueio.jpg';
      break;
    case 'tutoriais':
    case 'tutorial':
      pageImage = '/imagens/og-tutoriais.jpg';
      break;
    case 'vip':
      pageImage = '/imagens/og-vip.jpg';
      break;
    case 'calculadora':
      pageImage = '/imagens/fundo-calculadora.jpg';
      break;
    default:
      pageImage = customDefaultImage || '/imagens/og-padrao.jpg';
      break;
  }

  const fullImageUrl = typeof window !== 'undefined'
    ? (pageImage.startsWith('http') ? pageImage : `${window.location.origin}${pageImage}`)
    : pageImage;

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', fullImageUrl);

  const ogImgSecure = document.querySelector('meta[property="og:image:secure_url"]');
  if (ogImgSecure) ogImgSecure.setAttribute('content', fullImageUrl);

  const twImg = document.querySelector('meta[name="twitter:image"]');
  if (twImg) twImg.setAttribute('content', fullImageUrl);

  const linkImg = document.querySelector('link[rel="image_src"]');
  if (linkImg) linkImg.setAttribute('href', fullImageUrl);
}
