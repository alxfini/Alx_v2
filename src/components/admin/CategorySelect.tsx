import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

interface CategorySelectProps {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  existingCategories: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  label = 'Categoria',
  value,
  onChange,
  existingCategories,
  placeholder = 'Selecione ou crie uma categoria...',
  helperText,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const newCatInputRef = useRef<HTMLInputElement>(null);

  // Filtra categorias únicas e limpas
  const cleanCategories: string[] = Array.from<string>(
    new Set(
      existingCategories
        .map((c) => (c || '').trim())
        .filter((c) => c.length > 0)
    )
  ).sort((a: string, b: string) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foca no input quando alternar para criação
  useEffect(() => {
    if (isCreatingNew && newCatInputRef.current) {
      newCatInputRef.current.focus();
    }
  }, [isCreatingNew]);

  const handleSelectCategory = (cat: string) => {
    onChange(cat);
    setIsOpen(false);
    setIsCreatingNew(false);
  };

  const handleConfirmNewCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setNewCatInput('');
      setIsCreatingNew(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs text-neutral-900 font-mono font-bold uppercase tracking-wider block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {cleanCategories.length > 0 && (
            <span className="text-[10px] font-mono text-neutral-400">
              {cleanCategories.length} existente{cleanCategories.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}

      {isCreatingNew ? (
        // Modo Digitação de Nova Categoria
        <div className="space-y-2 p-2.5 bg-amber-50/70 border border-amber-300 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-900">
            <span className="flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              Criar Nova Categoria
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setNewCatInput('');
              }}
              className="text-neutral-500 hover:text-black underline cursor-pointer text-[10px]"
            >
              Voltar ao menu
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={newCatInputRef}
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmNewCategory();
                } else if (e.key === 'Escape') {
                  setIsCreatingNew(false);
                }
              }}
              placeholder="Digite o nome da nova categoria..."
              className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-black shadow-xs placeholder:text-neutral-400"
            />
            <button
              type="button"
              disabled={!newCatInput.trim()}
              onClick={handleConfirmNewCategory}
              className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-black text-[#ebbf01] text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Usar</span>
            </button>
          </div>
        </div>
      ) : (
        // Modo Dropdown Seletor com Opção de Criar Nova
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium flex items-center justify-between gap-2 shadow-xs transition-colors cursor-pointer focus:outline-none focus:border-black"
          >
            <span className={value ? 'text-neutral-900 font-bold' : 'text-neutral-400'}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              {/* Botão de Criar Nova Categoria */}
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setNewCatInput('');
                }}
                className="w-full px-3 py-2 text-left rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-dashed border-amber-300"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                <span>+ Criar Nova Categoria Personalizada</span>
              </button>

              {/* Lista de Categorias Existentes */}
              {cleanCategories.length > 0 && (
                <div className="pt-1 border-t border-neutral-100 space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Categorias Existentes
                  </div>
                  {cleanCategories.map((cat) => {
                    const isSelected = value?.trim().toLowerCase() === cat.trim().toLowerCase();
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full px-3 py-2 text-left rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-[#ebbf01] font-bold shadow-xs'
                            : 'text-neutral-800 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Se não houver categorias prévias */}
              {cleanCategories.length === 0 && (
                <div className="p-3 text-center text-xs text-neutral-400 font-mono">
                  Nenhuma categoria cadastrada ainda.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-neutral-500">{helperText}</p>}
    </div>
  );
};
