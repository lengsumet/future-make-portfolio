"use client";

"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import ShowcaseModal from '@/components/showcase/ShowcaseModal';

interface ShowcaseItem {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  tags: string[];
  price: number;
  livePreview: string;
}

const ShowcasePage = () => {
    const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);

    useEffect(() => {
        fetch('/data/showcase.json')
            .then(res => res.json())
            .then(data => setShowcaseItems(data));
    }, []);

    return (
        <Container className="py-16">
            <SectionHeader
                title="Website Showcase"
                subtitle="A collection of my finest work and templates."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {showcaseItems.map((item) => (
                    <Card
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                        tags={item.tags}
                        onClick={() => setSelectedItem(item)}
                    />
                ))}
            </div>

            <ShowcaseModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </Container>
    );
};

export default ShowcasePage;