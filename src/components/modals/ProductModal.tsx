import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ProductItem } from '../../types';
import { ShoppingBag, Star, ShieldCheck, Check, Truck, ExternalLink } from 'lucide-react';
import { getMediaPreviewUrl } from '../../utils/mediaUrl';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [orderInitiated, setOrderInitiated] = useState(false);

  if (!product) return null;

  const handleBuy = () => {
    setOrderInitiated(true);
    setTimeout(() => setOrderInitiated(false), 4000);
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} title="Detalhes do Produto • ALX" maxWidth="max-w-3xl">
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#161616] border border-[#262626]">
            <img
              src={getMediaPreviewUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#080808]/90 text-[#ebbf01] border border-[#2E2E2E]">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Info & Price */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="text-xl font-bold text-white font-heading">
                {product.name}
              </h3>

              {product.rating && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <div className="flex text-[#ebbf01]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-[#666666]">(Avaliação dos usuários)</span>
                </div>
              )}

              <div className="pt-2 flex items-baseline gap-3">
                <span className="text-2xl font-black text-[#ebbf01] font-heading">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#777777] line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed pt-1">
                {product.fullDescription || product.description}
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="space-y-2 pt-3 border-t border-[#222222] text-xs text-[#999999]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ebbf01]" />
                <span>Garantia oficial ALX de 12 meses contra defeitos</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#ebbf01]" />
                <span>Envio rápido com código de rastreamento direto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Table */}
        {product.specs && product.specs.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Especificações Técnicas:
            </h4>
            <div className="bg-[#141414] border border-[#222222] rounded-xl overflow-hidden divide-y divide-[#1F1F1F]">
              {product.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 text-xs">
                  <span className="text-[#888888] font-medium">{spec.label}</span>
                  <span className="text-white font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {orderInitiated && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Redirecionando para a loja parceira com cupom de desconto ALX aplicado!</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#252525] text-xs font-semibold transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={handleBuy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#ebbf01] text-black font-extrabold text-xs tracking-wider uppercase hover:bg-[#f5cc14] transition-all shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>COMPRAR AGORA ({product.price})</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
