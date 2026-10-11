import { NewsArticle } from '../types';

/**
 * Notícias completas e detalhadas dos 6 principais portais automobilísticos do Brasil:
 * 1. InsideEVs Brasil
 * 2. Motor1.com Brasil
 * 3. Autoesporte
 * 4. Quatro Rodas
 * 5. Canaltech
 * 6. Auto+ TV / Garagem360
 */
export const newsArticles: NewsArticle[] = [
  // --- INSIDEEVS BRASIL ---
  {
    id: 'news-insideevs-1',
    slug: 'byd-great-seagull-420km-autonomia-fabrica-camacari',
    title: 'BYD confirma hatch Great Seagull com 420 km de autonomia e acelera fábrica em Camaçari',
    summary: 'Posicionado estrategicamente entre o Dolphin Mini e o Dolphin tradicional, o novo modelo elétrico traz motor mais potente e preparação para produção nacional na Bahia.',
    content: `A BYD confirmou oficialmente o nome do seu próximo grande lançamento para o mercado brasileiro: o Great Seagull. Antecipado em reportagem do portal InsideEVs Brasil, o hatch elétrico chega para preencher o espaço estratégico entre o Dolphin Mini de entrada e o consagrado Dolphin.

### Desempenho e Conjunto Elétrico
O Great Seagull é construído sobre a e-Platform 3.0 de última geração e equipado com bateria Blade LFP de 48 kWh. Essa combinação entrega autonomia urbana de até 420 km no padrão PBEV/Inmetro e aceleração de 0 a 100 km/h em 8,5 segundos, superando os concorrentes diretos na categoria de compactos urbanos.

O motor elétrico dianteiro gera 102 cv de potência e 18,3 kgfm de torque instantâneo. A arquitetura elétrica permite recarga ultrarrápida em corrente contínua (DC) de 30% a 80% em apenas 28 minutos em estações de 60 kW.

### Produção Nacional em Camaçari (BA)
Além da novidade de produto, a montadora chinesa confirmou que os testes pré-série nas linhas de montagem do complexo industrial de Camaçari (BA) avançam no ritmo esperado. A fábrica terá capacidade inicial para produzir até 150 mil veículos por ano, podendo expandir para 250 mil unidades na segunda fase.

A produção baiana abastecerá o mercado brasileiro e servirá como hub de exportação para países da América Latina, incluindo Argentina, Chile e Colômbia. A nacionalização progressiva de componentes eletrônicos e estampagem deve garantir preços ainda mais competitivos nos próximos anos.`,
    category: 'Carros Elétricos',
    author: 'InsideEVs Brasil',
    date: '17 de Setembro, 2026',
    readTime: '5 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://insideevs.uol.com.br',
    tags: ['BYD', 'Great Seagull', 'Camaçari', 'Bahia', 'InsideEVs']
  },
  {
    id: 'news-insideevs-2',
    slug: 'faixa-150-mil-sweet-spot-eletricos-brasil-leapmotor-c10',
    title: 'Faixa dos R$ 150 mil vira o novo "sweet spot" dos elétricos no Brasil com a chegada do Leapmotor C10',
    summary: 'Análise do InsideEVs mostra como os SUVs elétricos médios estão concentrando a maior disputa de mercado do país com autonomia real superior a 400 km.',
    content: `Com o mercado de veículos elétricos atingindo maturidade acelerada no Brasil, a faixa de preços entre R$ 145.000 e R$ 165.000 passou a concentrar as atenções das montadoras globais e dos consumidores urbanos.

### Disputa Acirrada no Segmento Médio
Segundo levantamento minucioso do portal InsideEVs Brasil, modelos como o recém-lançado SUV Leapmotor C10 (fruto da parceria global com o grupo Stellantis), o Chevrolet Spark EUV e o GWM Ora 5 estão redefinindo as expectativas de quem busca migrar para a mobilidade zero emissões.

Esses veículos entregam pacotes de baterias na faixa dos 55 kWh a 68 kWh, oferecendo alcance suficiente para viagens intermunicipais sem ansiedade de autonomia (superando 400 km no ciclo urbano e 320 km em rodovias).

### Conectividade e Recursos Avançados
Além da eficiência de consumo, os utilitários esportivos dessa faixa destacam-se pelos sistemas avançados de assistência ao motorista (ADAS Nível 2+), controle de cruzeiro adaptativo stop&go, câmeras de visão 360 graus e cabines hiperconectadas com atualização de software via nuvem (OTA).`,
    category: 'Carros Elétricos',
    author: 'InsideEVs Brasil',
    date: '15 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://insideevs.uol.com.br',
    tags: ['Leapmotor', 'Stellantis', 'SUVs Elétricos', 'InsideEVs']
  },

  // --- MOTOR1.COM BRASIL ---
  {
    id: 'news-motor1-1',
    slug: 'guerra-de-precos-carros-eletricos-mais-baratos-brasil-2026',
    title: 'Guerra de preços derruba teto dos carros elétricos mais baratos no Brasil para R$ 119.990',
    summary: 'Com BYD Dolphin Mini, Geely EX2, MG4 Urban e GAC Aion UT disputando cada venda, o teto dos 10 elétricos mais baratos no país caiu para R$ 176 mil em 2026.',
    content: `O mercado automotivo brasileiro vive um período de reestruturação de preços sem precedentes na faixa dos veículos elétricos de entrada. Levantamento do portal Motor1 aponta que o valor máximo para estar no ranking dos dez carros 100% elétricos mais em conta no país caiu drasticamente no último ano.

### Ranking dos Compactos Elétricos
Na liderança das vendas de varejo, o BYD Dolphin Mini se consolida como o elétrico mais vendido do Brasil a partir de R$ 119.990, seguido pelo Geely EX2 por R$ 123.800 — modelo eleito o "Melhor Elétrico Urbano" pelo júri especializado graças ao seu conjunto equilibrado e baixo custo de manutenção.

A disputa ganha novos competidores com o hatch MG4 Urban por R$ 129.990 e o recém-chegado GAC Aion UT na faixa de R$ 139.990, trazendo de série pacote completo de assistências de condução ADAS Nível 2 e bateria LFP com 400 km de alcance no ciclo urbano.

### Vantagens para o Consumidor
Além da queda nos preços de aquisição, os proprietários se beneficiam de isenção ou alíquotas reduzidas de IPVA em diversos estados, custo de combustível por quilômetro rodado até 80% menor em comparação a carros a gasolina e revisões com preço fixo transparente.`,
    category: 'Carros Elétricos',
    author: 'Motor1.com Brasil',
    date: '16 de Setembro, 2026',
    readTime: '5 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://motor1.uol.com.br',
    tags: ['Motor1', 'BYD', 'Geely EX2', 'MG4', 'GAC Aion', 'Preços']
  },
  {
    id: 'news-motor1-2',
    slug: 'baic-dfm-im-anunciam-chegada-ao-brasil-suvs-hatches',
    title: 'BAIC, DFM e IM anunciam chegada oficial ao Brasil com linha de SUVs e hatches 100% elétricos',
    summary: 'Novas fabricantes chinesas desembarcam no país ainda em 2026 prometendo investimentos de mais de R$ 2 bilhões em rede de concessionárias e centro logístico.',
    content: `A invasão de marcas globais eletrificadas no Brasil ganha uma nova etapa crucial. Reportagem exclusiva do portal Motor1.com Brasil confirma a homologação e início das operações de três novas gigantes automotivas chinesas: BAIC (com a linha Arcfox), DFM (Dongfeng) e IM Motors.

### Estratégia de Produto e Modelos
A BAIC estreia com o Arcfox T1, hatch urbano elétrico focado no segmento abaixo de R$ 150 mil, além do SUV médio Arcfox T5. Já a IM Motors foca no segmento premium trazendo o luxuoso crossover Avatr 11 com inteligência artificial para condução semiautônoma.

### Expansão da Rede de Concessionárias
O plano de investimentos das marcas inclui a expansão acelerada de mais de 80 concessionárias nos grandes centros urbanos do Sudeste, Sul e Nordeste até o primeiro semestre de 2027, garantindo estoque local de peças e suporte pós-venda completo.`,
    category: 'Carros Elétricos',
    author: 'Motor1.com Brasil',
    date: '14 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://motor1.uol.com.br',
    tags: ['Motor1', 'BAIC', 'DFM', 'IM Motors', 'Lançamentos']
  },

  // --- AUTOESPORTE ---
  {
    id: 'news-autoesporte-1',
    slug: 'cadillac-estreia-brasil-suvs-eletricos-lyriq-vistiq',
    title: 'Cadillac desembarca oficialmente no Brasil com SUVs elétricos Lyriq e Vistiq por até R$ 990 mil',
    summary: 'Braço de luxo da General Motors inicia vendas oficiais no país focando 100% na mobilidade elétrica. Crossover Lyriq chega por R$ 820 mil e o SUV de 6 lugares Vistiq estreia por R$ 990 mil.',
    content: `A emblemática marca de luxo da General Motors, Cadillac, abriu oficialmente suas operações comerciais no Brasil. A fabricante norte-americana escolheu o mercado brasileiro para acelerar sua expansão global rumo à mobilidade zero emissões, trazendo um portfólio de SUVs 100% elétricos.

### Cadillac Lyriq: Design Cupê e 507 cv
O primeiro destaque da marca no país é o Cadillac Lyriq, um crossover cupê de porte grande oferecido por R$ 820.000. Equipado com dois motores elétricos e tração integral AWD, ele entrega 507 cv de potência, bateria Ultium de 102 kWh e autonomia homologada de 460 km no padrão Inmetro.

### Cadillac Vistiq: Requinte para 6 Ocupantes
Para famílias que buscam máximo espaço e requinte, a marca lançou simultaneamente o Cadillac Vistiq, SUV elétrico de três fileiras com 6 assentos individuais por R$ 990.000. O modelo gera expressivos 623 cv e conta com arquitetura de recarga ultrarrápida de até 190 kW em corrente contínua (DC).`,
    category: 'Carros Elétricos',
    author: 'Autoesporte',
    date: '17 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://autoesporte.globo.com',
    tags: ['Autoesporte', 'Cadillac', 'Lyriq', 'Vistiq', 'GM', 'Luxo']
  },
  {
    id: 'news-autoesporte-2',
    slug: 'premio-qual-comprar-2026-geely-ex2-desvalorizacao',
    title: 'Prêmio Qual Comprar 2026: Geely EX2 e Leapmotor C10 lideram menor desvalorização entre os elétricos',
    summary: 'Estudo anual promovido pela revista Autoesporte aponta os modelos zero emissão com maior retenção de valor de revenda e menor custo de revisões no Brasil.',
    content: `A equipe de testes da revista Autoesporte divulgou o resultado do prestigiado prêmio "Qual Comprar 2026", destacando os veículos elétricos mais vantajosos para o bolso do consumidor brasileiro.

### Menor Desvalorização do Mercado
O Geely EX2 conquistou a categoria "Melhor Carro Elétrico de Entrada", impulsionado por uma taxa de desvalorização anual de apenas 7,2% — marca inferior até mesmo a muitos veículos flex tradicionais. A garantia de 8 anos para a bateria e a rede de pós-venda foram pontos decisivos.

### Custo Benefício do Leapmotor C10
Entre os SUVs elétricos médios, o prêmio ficou com o Leapmotor C10, elogiado pelo pacote completo de segurança ativa, acabamento interno premium e custos de revisão com preço fixo transparente.`,
    category: 'Dicas',
    author: 'Autoesporte',
    date: '12 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://autoesporte.globo.com',
    tags: ['Autoesporte', 'Qual Comprar', 'Geely EX2', 'Desvalorização', 'Dicas']
  },

  // --- QUATRO RODAS ---
  {
    id: 'news-quatrorodas-1',
    slug: 'baterias-estado-solido-1000km-autonomia-testes-2026',
    title: 'Baterias de estado sólido entram em homologação com 1.000 km de autonomia real e recarga em 12 min',
    summary: 'Novas células com densidade energética superior a 450 Wh/kg eliminam a ansiedade de autonomia e viabilizam viagens sem paradas prolongadas em eletropostos.',
    content: `O avanço científico no armazenamento de energia atingiu um marco divisor de águas na indústria automotiva mundial. A revista Quatro Rodas acompanhou de perto os testes em pista fechada dos primeiros protótipos equipados com células de eletrólito sólido produzidas em escala pré-industrial.

### Tecnologia de Eletrólito Sólido
Diferente das baterias tradicionais com eletrólito líquido inflamável, o composto sintético sólido suporta elevadíssimas taxas de carregamento em corrente contínua sem risco de superaquecimento, dendritos ou degradação acelerada. A densidade energética aferida superou 450 Wh/kg, quase o dobro dos pacotes LFP convencionais de última geração.

### Teste de Autonomia e Carga Rápida
Na prática, um sedã de porte médio equipado com o novo pacote percorreu impressionantes 1.020 km em ciclo misto rodoviário e urbano com apenas uma carga completa. Em um carregador ultrarrápido de 800V, a recarga de 10% a 80% foi concluída em apenas 11 minutos e 40 segundos, tempo equivalente a uma pausa rápida em um posto de combustível convencional.

### Previsão de Lançamento Comercial
As principais montadoras que financiam o consórcio de desenvolvimento estimam que os primeiros modelos de produção em série equipados com baterias de estado sólido chegarão ao mercado consumidor até o segundo semestre de 2027.`,
    category: 'Tecnologia',
    author: 'Quatro Rodas',
    date: '16 de Setembro, 2026',
    readTime: '6 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1558441719-67450807429f?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://quatrorodas.abril.com.br',
    tags: ['Quatro Rodas', 'Baterias', 'Estado Sólido', 'Autonomia', 'Tecnologia']
  },
  {
    id: 'news-quatrorodas-2',
    slug: 'ranking-quatrorodas-melhores-eletricos-hibridos-350-mil',
    title: 'Ranking Quatro Rodas 2026: Os 10 melhores carros elétricos e híbridos plug-in até R$ 350 mil',
    summary: 'Comparativo detalhado avalia consumo de energia, desempenho em dinamômetro, isolamento acústico e espaço interno de dez competidores eletrificados.',
    content: `A equipe de jornalistas e engenheiros especializados da Quatro Rodas submeteu a testes de pista rigorosos os dez principais carros 100% elétricos (BEV) e híbridos plug-in (PHEV) comercializados no Brasil na faixa entre R$ 180.000 e R$ 350.000.

### Vencedores por Categoria
O destaque da avaliação técnica no segmento dos sedãs esportivos ficou com o BYD Seal EV, elogiado pelo tempo de aceleração de 0 a 100 km/h em 3,8 segundos e tração integral inteligente. No segmento de SUVs urbanos de luxo, o Volvo EX30 garantiu a primeira colocação pelo acabamento sustentável, design escandinavo e forte eficiência de consumo de kWh por 100 km.

### Dossiê de Testes de Pista
O dossiê completo publicado pela Quatro Rodas traz curvas reais de aceleração e retomada, medição de ruído em decibéis a 120 km/h, espaço interno para joelhos e cabeça e custos comparativos de seguro e peças de reposição.`,
    category: 'Dicas',
    author: 'Quatro Rodas',
    date: '11 de Setembro, 2026',
    readTime: '5 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://quatrorodas.abril.com.br',
    tags: ['Quatro Rodas', 'Ranking', 'BYD Seal', 'Volvo EX30', 'Testes']
  },

  // --- CANALTECH ---
  {
    id: 'news-canaltech-1',
    slug: 'atualizacoes-ota-android-automotive-dilink-2026',
    title: 'Atualizações OTA em multimídias: Como o Android Automotive OS e BYD DiLink transformam o painel',
    summary: 'Sistemas inteligentes ganham novos launchers, split-screen para streaming, telemetria em tempo real e controle climático inteligente via atualização na nuvem.',
    content: `A experiência dentro do cockpit automotivo moderno é cada vez mais guiada pela sofisticação do ecossistema de software. Plataformas operacionais como o Android Automotive OS nativo e o sistema BYD DiLink estão recebendo atualizações constantes via nuvem (Over-The-Air) que transformam as centrais multimídia.

### Recursos das Novas Atualizações
Conforme destacado em análise do Canaltech, os novos pacotes de software trazem suporte a interfaces flexíveis em telas giratórias ou panorâmicas de até 15.6", pré-condicionamento preditivo da temperatura da bateria antes de chegar ao eletroposto e espelhamento sem fio otimizado.

### Otimização para Processadores Snapdragon
A equipe de desenvolvimento da ALX cria aplicativos e utilitários específicos para otimizar o desempenho dessas centrais, permitindo que motoristas e passageiros aproveitem ao máximo o poder de processamento das plataformas Snapdragon Cockpit.`,
    category: 'Multimídia',
    author: 'Canaltech',
    date: '16 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1551522435-a13afd1ce663?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://canaltech.com.br',
    tags: ['Canaltech', 'Android Automotive', 'DiLink', 'OTA', 'Multimídia']
  },
  {
    id: 'news-canaltech-2',
    slug: 'guia-telemetria-obd2-saude-da-bateria-soh-eletricos',
    title: 'Guia prático OBD2: Como verificar a saúde real da bateria (SoH) e temperatura das células',
    summary: 'Aprenda a acessar métricas ocultas do sistema BMS utilizando adaptadores OBD2 via Bluetooth e aplicativos de telemetria.',
    content: `Ao comprar ou avaliar um veículo elétrico seminovo, olhar apenas para a porcentagem de bateria no painel não conta toda a história. Parâmetros críticos como o State of Health (SoH), a curva de descarga sob esforço e a variação térmica entre as células são fundamentais para entender a vida útil do conjunto motriz.

### Leitura do Barramento CAN via OBD2
Utilizando a porta de diagnóstico OBD2 do veículo conectada a um scanner compatível com barramento CAN de alta velocidade, é possível extrair dados diretamente do BMS (Battery Management System).

### Passo a Passo de Diagnóstico
No guia prático publicado pelo Canaltech em parceria técnica com especialistas de telemetria da ALX, explicamos como conectar o scanner, selecionar as bibliotecas de PIDs específicas para o seu modelo e identificar parâmetros de integridade para garantir a durabilidade do veículo.`,
    category: 'Dicas',
    author: 'Canaltech',
    date: '10 de Setembro, 2026',
    readTime: '5 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://canaltech.com.br',
    tags: ['Canaltech', 'OBD2', 'Telemetria', 'SoH', 'Bateria', 'BMS'],
    isMembersOnly: true,
    isVipExclusive: true
  },

  // --- AUTO+ TV / GARAGEM360 ---
  {
    id: 'news-autoplus-1',
    slug: 'corredores-eletricos-eletropostos-ultrarrapidos-brasil-2026',
    title: 'Rodovias brasileiras ganham rede de eletropostos ultrarrápidos de até 350 kW',
    summary: 'Expansão de pontos de recarga em corrente contínua nas principais rodovias do Sudeste e Sul simplifica viagens longas com tecnologia Plug&Charge.',
    content: `A infraestrutura de carregamento para veículos elétricos no Brasil vive uma nova fase de expansão com foco em velocidade. Parcerias entre distribuidoras de energia, redes de conveniência e montadoras inauguraram dezenas de estações ultrarrápidas de 150 kW a 350 kW em importantes rodovias brasileiras.

### Carregamento Ultrarrápido e Plug&Charge
Com conectores universais CCS2 e comunicação direta Plug&Charge, os veículos compatíveis iniciam a recarga no momento em que o cabo é conectado, sem necessidade de aplicativos instáveis ou cartões de liberação.

### Conexão entre Capitais
Segundo reportagem do portal Auto+ TV, esses corredores conectam as principais capitais com paradas a cada 80 km em média, permitindo que viagens de longa distância sejam feitas com pausas rápidas de apenas 15 a 20 minutos para recuperar até 80% da carga da bateria.`,
    category: 'Atualizações',
    author: 'Auto+ TV',
    date: '15 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://automaistv.com.br',
    tags: ['Auto+ TV', 'Eletropostos', 'Infraestrutura', 'Recarga Ultrarrápida', 'Rodovias']
  },
  {
    id: 'news-autoplus-2',
    slug: 'volvo-es90-seda-eletrico-confirmado-brasil-2026',
    title: 'Volvo confirma sedã elétrico de luxo ES90 para o Brasil com mais de 600 km de autonomia',
    summary: 'Marca sueca marca seu retorno triunfal ao segmento de sedãs executivos topo de linha com arquitetura totalmente elétrica de 800V.',
    content: `A Volvo Cars confirmou oficialmente a chegada do seu mais novo sedã topo de linha ao mercado brasileiro: o Volvo ES90. O modelo 100% elétrico foi apresentado pelo portal Auto+ TV como o sucessor tecnológico do lendário S90.

### Desempenho e Autonomia de 600 km
Equipado com pacote de baterias de 111 kWh brutos e motores elétricos duplos com tração AWD, o ES90 alcança mais de 600 km no ciclo WLTP. A arquitetura elétrica de 800V suporta recargas de até 250 kW em corrente contínua, permitindo adicionar 300 km de autonomia em apenas 10 minutos.

### Tecnologia Embarcada e Segurança
O sedã chegará às concessionárias brasileiras no final deste ano trazendo o conjunto completo de radares LiDAR de teto e o novo sistema multimídia rodando Android Automotive OS nativo.`,
    category: 'Carros Elétricos',
    author: 'Auto+ TV',
    date: '09 de Setembro, 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://automaistv.com.br',
    tags: ['Auto+ TV', 'Volvo ES90', 'Sedã Elétrico', 'Luxo']
  }
];
