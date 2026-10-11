import React from 'react';
import { ShoppingBag, ExternalLink, CheckCircle2, Star, Eye, ShieldCheck } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { ProductItem } from '../types';
import { getMediaPreviewUrl } from '../utils/mediaUrl';

interface ProductsSectionProps {
  onSelectProduct: (product: ProductItem) => void;
  isStandalone?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ onSelectProduct, isStandalone = false }) => {
  const { products, setActivePage } = useSiteData();

  return (
    <section id="produtos" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative`}>
      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#ebbf01] uppercase tracking-wider bg-[#141419] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Hardware & Acessórios Testados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
              Equipamentos Recomendados
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Dispositivos OBD2, pen drives de alta performance e acessórios homologados pessoalmente pela equipe ALX.
            </p>
          </div>
        </div>

        {/* Products Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-[#111115] border border-white/[0.08] hover:border-[#ebbf01]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div>
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imagens/produtos/dongle-v2.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-black/30" />

                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#ebbf01] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/[0.1]">
                      {product.badge}
                    </div>
                  )}
                </a>

                <div className="p-5 space-y-3">
                  {product.category && (
                    <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                      {product.category}
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white group-hover:text-[#ebbf01] transition-colors font-heading line-clamp-1">
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

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="pt-2 border-t border-white/[0.04] flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#ebbf01] font-heading font-mono">
                      {product.price || 'Consulte'}
                    </span>
                    {product.originalPrice && !product.originalPrice.toLowerCase().includes('site') && (
                      <span className="text-xs text-neutral-500 line-through font-mono">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black text-xs font-extrabold uppercase transition-all shadow-md shadow-[#ebbf01]/20 cursor-pointer"
                >
                  <span>Comprar na Loja</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

