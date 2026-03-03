import React from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import LiveStats from '@/components/showcase/LiveStats';

interface ShowcaseItem {
  id: number;
  title: string;
  longDescription: string;
  price: number;
  tags: string[];
  livePreview: string;
  gallery: string[];
}

interface ShowcaseModalProps {
  item: ShowcaseItem | null;
  onClose: () => void;
}

const ShowcaseModal: React.FC<ShowcaseModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative h-96 rounded-lg overflow-hidden mb-4">
             <Image src={item.gallery[0]} alt={item.title} fill className="object-cover" />
          </div>
           <div className="flex space-x-2">
                {item.gallery.map((img, index) => (
                    <div key={index} className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image src={img} alt={`${item.title} thumbnail ${index + 1}`} fill className="object-cover" />
                    </div>
                ))}
            </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">{item.title}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag) => (
              <span key={tag} className="bg-primary/50 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-300 mb-6">{item.longDescription}</p>

          {/* Live Stats for WMS */}
          {item.livePreview?.includes("3001") && <LiveStats system="wms" />}
          {item.livePreview?.includes("3002") && <LiveStats system="pos" />}
          {item.livePreview?.includes("3003") && <LiveStats system="crm" />}

          <div className="mb-6">
            <h4 className="font-semibold text-white mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-gray-400">
                <li>Responsive Design</li>
                <li>Modern Tech Stack</li>
                <li>Easy to Customize</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
             <p className="text-3xl font-bold text-white">${item.price}</p>
             <div className="flex space-x-4">
                <a href={item.livePreview} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">Live Preview</Button>
                </a>
                <Button>Purchase</Button>
             </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowcaseModal;