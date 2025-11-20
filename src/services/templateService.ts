// src/services/templateService.ts
import { CategoryTemplate, Music } from '../types';

const TEMPLATE_STORAGE_KEY = 'kalpana_category_templates_v1';

// Music objects defined to match the new Music type for default templates
const festiveMusic: Music = {
  id: 'indian-festival',
  name: 'Indian Traditional Festival',
  description: 'Perfect for Diwali, Holi, religious celebrations, and auspicious occasions',
  mood: 'festive-traditional',
  cloudinaryId: 'kalpana-assets/indian-traditional-festival',
  category: 'Festival',
  icon: '🪔'
};

const modernMusic: Music = {
  id: 'bollywood-punjabi',
  name: 'Bollywood Punjabi',
  description: 'Modern Bollywood Punjabi beats - great for colorful, vibrant products',
  mood: 'energetic',
  cloudinaryId: 'bollywood-punjabi-music-298969_rqhghe',
  category: 'Festival',
  icon: '💃'
};


// Add default starter templates to improve the user experience on first load.
const defaultTemplates: (CategoryTemplate & { isDefault?: boolean })[] = [
  {
    id: 'default-festive-decor',
    name: 'Starter: Festive Decor',
    category: 'Meenakari Auspicious Decor',
    targeting: { platform: 'Instagram Reels', audience: 'Parents & Families', aspectRatio: '9:16' },
    language: 'Hindi',
    creativeDirection: {
      tone: 'Luxurious',
      lighting: 'Soft, warm, devotional light',
      composition: ['Close-up on gold texture', 'Ganesha figure focus'],
    },
    music: festiveMusic,
    narrationVoice: { language: 'hindi', gender: 'male', style: 'Deep, authoritative' },
    createdAt: Date.now() + 1, // ensure it sorts after the other default
    isDefault: true,
  },
  {
    id: 'default-modern-craft',
    name: 'Starter: Modern Craft',
    category: 'MDF Rangoli',
    targeting: { platform: 'TikTok', audience: 'Young Adults (18-24)', aspectRatio: '9:16' },
    language: 'English',
    creativeDirection: {
      tone: 'Playful',
      lighting: 'Bright, natural lighting',
      composition: ['Top-down assembly time-lapse', 'Color filling shots'],
    },
    music: modernMusic,
    narrationVoice: { language: 'english', gender: 'female', style: 'Engaging, warm' },
    createdAt: Date.now(),
    isDefault: true,
  }
];

const getSavedUserTemplates = (): CategoryTemplate[] => {
    try {
        const savedRaw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (savedRaw) {
            const parsed = JSON.parse(savedRaw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to parse user templates from localStorage, ignoring them.", e);
    }
    return [];
};


export const getAllTemplates = (): (CategoryTemplate & { isDefault?: boolean })[] => {
    const userTemplates = getSavedUserTemplates();

    const combinedTemplates = [...userTemplates, ...defaultTemplates];
    const uniqueTemplates: (CategoryTemplate & { isDefault?: boolean })[] = [];
    const seenIds = new Set<string>();

    // This loop ensures user-saved templates take priority over defaults if IDs clash
    for (const template of combinedTemplates) {
        if (!seenIds.has(template.id)) {
            uniqueTemplates.push(template);
            seenIds.add(template.id);
        }
    }

    return uniqueTemplates.sort((a, b) => b.createdAt - a.createdAt);
};

export const saveTemplate = (template: Omit<CategoryTemplate, 'id' | 'createdAt' | 'name'>, name: string): CategoryTemplate => {
    const userTemplates = getSavedUserTemplates();

    const newTemplate: CategoryTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name,
        createdAt: Date.now(),
    };
    const newTemplates = [...userTemplates, newTemplate];
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(newTemplates));
    return newTemplate;
};

export const loadTemplate = (templateId: string): CategoryTemplate | undefined => {
    const allTemplates = getAllTemplates();
    return allTemplates.find(t => t.id === templateId);
};

export const deleteTemplate = (templateId: string): void => {
    const userTemplates = getSavedUserTemplates();
    const newTemplates = userTemplates.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(newTemplates));
};