import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Sparkles, 
  ChevronDown
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { getMediaPreviewUrl } from '../utils/mediaUrl';

interface ShopSectionProps {
  isStandalone?: boolean;
}

export const ShopSection: React.FC<ShopSectionProps> = ({ isStandalone = false }) => {
  const { 
    products, 
    isSyncingShop, 
    syncShopProducts, 
    brand 
  } = useSiteData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Responsive Pagination State: 5 items on mobile, 12 items on web
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const batchSize = isMobile ? 5 : 12;
  const [visibleLimit, setVisibleLimit] = useState(batchSize);

  // Auto-sync products when the shop page mounts
  useEffect(() => {
    syncShopProducts();
  }, []);

  // Reset limit when search, category or screen size changes
  useEffect(() => {
    setVisibleLimit(isMobile ? 5 : 12);
  }, [searchQuery, selectedCategory, isMobile]);

  // Extract unique categories
  const categories = useMemo(() => {
    const list = ['Todos'];
    products.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleLimit);
  }, [filteredProducts, visibleLimit]);

  const hasMoreProducts = visibleLimit < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleLimit((prev) => prev + (isMobile ? 5 : 12));
  };

  const handleSync = async () => {
    setSyncFeedback('Sincronizando produtos com ALX Shop...');
    const res = await syncShopProducts();
    if (res.success) {
      setSyncFeedback(`Sincronização concluída! ${res.count} produtos atualizados.`);
    } else {
      setSyncFeedback(res.error || 'Erro ao sincronizar produtos.');
    }
    setTimeout(() => setSyncFeedback(null), 4500);
  };

  return (
    <section id="shop" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[75%] lg:max-w-[75vw] mx-auto px-2 sm:px-4 relative z-10 space-y-6">
        
        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="p-3.5 rounded-2xl bg-[#16161E] border border-[#ebbf01]/30 text-white text-xs flex items-center gap-2.5 animate-in fade-in duration-300 shadow-xl">
            <Sparkles className="w-4 h-4 text-[#ebbf01] shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
        )}

        {/* Actions Bar Card (Matching YouTube / News Section Header) */}
        <div className="bg-[#111116] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-center sm:text-left gap-4">
          
          {/* Left: Shop Specific Logo */}
          <div className="flex items-center justify-center sm:justify-start shrink-0 mx-auto sm:mx-0">
            <img
              src={brand.shopSectionLogoUrl || brand.youtubeSectionLogoUrl || '/logo_alx_garage.png'}
              alt="ALX Shop"
              className="h-8 sm:h-9.5 w-auto object-contain max-w-[200px]"
            />
          </div>

          {/* Right Controls: Search Input & Manual Sync / Refresh Button */}
          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-56 h-8.5">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-8 pr-3 bg-[#16161D] text-white text-xs rounded-xl border border-white/[0.1] focus:border-[#ebbf01] focus:outline-none placeholder:text-neutral-500 transition-all"
              />
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleSync}
              disabled={isSyncingShop}
              className="h-8.5 inline-flex items-center justify-center gap-1.5 px-3.5 bg-[#ebbf01] hover:bg-[#f5cc14] text-black text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#ebbf01]/20 shrink-0 disabled:opacity-50 cursor-pointer"
              title="Sincronizar produtos com a loja ALX Shop"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingShop ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">{isSyncingShop ? 'Sincronizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.map((product) => {
                const priceText = product.price || '';
                const lowerPrice = priceText.toLowerCase();
                const hasValidPrice = priceText.trim() !== '' && !lowerPrice.includes('consulta') && !lowerPrice.includes('site');

                return (
                  <div
                    key={product.id}
                    className="group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image linking directly to store */}
                      <a
                        href={product.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative aspect-square overflow-hidden bg-[#16161D] cursor-pointer"
                        title={product.name}
                      >
                        <img
                          src={getMediaPreviewUrl(product.imageUrl)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/20" />

                        {product.badge && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#ebbf01]/40 text-[#ebbf01] font-mono text-[10px] font-bold">
                            {product.badge}
                          </div>
                        )}
                      </a>

                      {/* Body Content */}
                      <div className="p-5 space-y-3">
                        {product.category && !product.category.toLowerCase().includes('alx') && !product.category.toLowerCase().includes('garage') && (
                          <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                            {product.category}
                          </div>
                        )}

                        <h3 className="text-base font-bold text-white font-heading line-clamp-2 min-h-[3rem]">
                          <a
                            href={product.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={product.name}
                            className="hover:underline"
                          >
                            {product.name}
                          </a>
                        </h3>

                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed min-h-[2rem]">
                          {product.description}
                        </p>

                        {/* Price Block: Displays real product price, original regular price, discount */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between min-h-[2.5rem]">
                          {hasValidPrice ? (
                            <div>
                              <div className="text-xl font-black text-[#ebbf01] font-heading font-mono">
                                {product.price}
                              </div>
                              {product.originalPrice && !product.originalPrice.toLowerCase().includes('site') && !product.originalPrice.toLowerCase().includes('consulta') && (
                                <div className="text-xs text-neutral-500 line-through font-mono">
                                  {product.originalPrice}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-neutral-400 font-mono">
                              {product.price || 'Sob Consulta'}
                            </div>
                          )}

                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Button: Direct link to store */}
                    <div className="p-5 pt-0">
                      <a
                        href={product.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black font-extrabold text-xs uppercase tracking-wide transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                      >
                        <span>Comprar na Loja</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 rounded-2xl bg-[#16161D] hover:bg-[#20202B] border border-white/[0.1] hover:border-[#ebbf01]/40 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-[#ebbf01]/10 inline-flex items-center gap-2 cursor-pointer group"
                >
                  <ChevronDown className="w-4 h-4 text-[#ebbf01] group-hover:translate-y-0.5 transition-transform" />
                  <span>Carregar Mais Produtos ({filteredProducts.length - visibleLimit} restantes)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#111116] border border-white/[0.08] rounded-3xl p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Não encontramos nenhum item correspondente aos filtros selecionados. Tente buscar por outros termos ou clique em sincronizar.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="px-4 py-2 bg-[#181820] hover:bg-[#222230] border border-white/[0.08] text-xs font-bold text-white rounded-xl cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
