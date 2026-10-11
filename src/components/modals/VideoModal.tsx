import React from 'react';
import { Modal } from '../ui/Modal';
import { YouTubeVideo } from '../../types';
import { Youtube, ExternalLink, Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

interface VideoModalProps {
  video: YouTubeVideo | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <Modal isOpen={!!video} onClose={onClose} title="Vídeo • ALX YouTube" maxWidth="max-w-4xl">
      <div className="space-y-6">
        
        {/* Responsive Video Embed Container */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#222222]">
          {video.youtubeId && video.youtubeId !== 'dQw4w9WgXcQ' ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111] p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                <Youtube className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">{video.title}</h4>
                <p className="text-xs text-[#888888]">
                  ID do vídeo demonstrativo configurado. Você pode alterar para qualquer ID de vídeo real no arquivo <code>src/data/videos.ts</code>.
                </p>
              </div>
              <a
                href={video.videoUrl || siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ebbf01] text-black font-bold text-xs"
              >
                <span>Assistir no Canal do YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#888888]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#ebbf01] bg-[#1A1A1A] px-2.5 py-0.5 rounded border border-[#2A2A2A]">
                {video.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {video.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {video.duration}
              </span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            {video.title}
          </h3>

          <p className="text-sm text-[#AAAAAA] leading-relaxed whitespace-pre-line">
            {video.description}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#252525] text-xs font-semibold transition-colors"
          >
            Fechar
          </button>

          <a
            href={siteConfig.links.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#ebbf01] text-black font-bold text-xs hover:bg-[#f5cc14] transition-all"
          >
            <Youtube className="w-4 h-4 text-red-600" />
            <span>Inscrever-se no Canal ALX</span>
          </a>
        </div>

      </div>
    </Modal>
  );
};
