// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Product, ImageInfo, CategoryTemplate } from '../types';
import { initialProducts } from '../data/products';
import { fileToImageInfo } from '../utils/fileUtils';
import { getAllTemplates, loadTemplate } from '../services/templateService';
import FileUpload from '../components/FileUpload';

const PRODUCTS_STORAGE_KEY = 'kalpana_user_products';

interface HomePageProps {
  onNext: (product: Product, mainImage: ImageInfo, referenceImages: ImageInfo[]) => void;
  onLoadTemplate: (template: CategoryTemplate) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNext, onLoadTemplate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<ImageInfo | null>(null);
  const [referenceImages, setReferenceImages] = useState<ImageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');

  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');

  const loadProducts = () => {
    try {
      const savedProductsRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const savedProducts = savedProductsRaw ? JSON.parse(savedProductsRaw) : [];
      const allProducts = [...savedProducts, ...initialProducts];
      const uniqueProducts = allProducts.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));
      setProducts(uniqueProducts);
      if (!selectedProduct && uniqueProducts.length > 0) {
        setSelectedProduct(uniqueProducts[0]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(initialProducts);
      if (!selectedProduct && initialProducts.length > 0) {
        setSelectedProduct(initialProducts[0]);
      }
    }
  };

  useEffect(() => {
    loadProducts();
    setTemplates(getAllTemplates());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (templateId !== 'none') {
      const template = loadTemplate(templateId);
      if (template) {
        onLoadTemplate(template);
      }
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find(p => p.id === e.target.value);
    if (product) {
      setSelectedProduct(product);
    }
  };
  
  const handleAddNewProduct = () => {
    if (!newProductName.trim() || !newProductDescription.trim() || !newProductCategory.trim()) {
      setError("Please fill out all fields for the new product.");
      return;
    }
    setError(null);
    try {
      const savedProductsRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const savedProducts = savedProductsRaw ? JSON.parse(savedProductsRaw) : [];
      
      const newProduct: Product = {
        id: `custom-${Date.now()}`,
        name: newProductName.trim(),
        description: newProductDescription.trim(),
        category: newProductCategory.trim(),
      };

      savedProducts.unshift(newProduct);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(savedProducts));
      
      alert('Product saved successfully!');
      setShowNewProductForm(false);
      setNewProductName('');
      setNewProductDescription('');
      setNewProductCategory('');
      loadProducts(); // Reload all products to update the list
      setSelectedProduct(newProduct);

    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleMainFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setError(null);
      const info = await fileToImageInfo(files[0]);
      setMainImage(info);
    } catch (err) {
      console.error(err);
      setError("Could not process the selected file. Please try another image.");
    }
  };
  
  const handleReferenceFilesSelect = async (files: File[]) => {
    try {
      setError(null);
      const newImageInfos = await Promise.all(files.map(fileToImageInfo));
      setReferenceImages(prev => [...prev, ...newImageInfos].slice(0, 6)); // Limit to 6
    } catch (err) {
      console.error(err);
      setError("Could not process one or more of the selected reference images.");
    }
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }
    if (!mainImage) {
      setError("Please upload a main product image.");
      return;
    }
    setError(null);
    onNext(selectedProduct, mainImage, referenceImages);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-200">Start a New Video Project</h2>
        <p className="text-gray-400">Select a template, choose your product, and upload images to begin.</p>
      </div>

      <div className="space-y-6">
        {templates.length > 0 && (
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-300">
              Load from Template (Optional)
            </label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="none">-- Start from Scratch --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-300">
            Select a Product
          </label>
          <div className="flex gap-2 mt-1">
            <select
              id="product-select"
              value={selectedProduct?.id || ''}
              onChange={handleProductChange}
              disabled={showNewProductForm}
              className="block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <button onClick={() => setShowNewProductForm(prev => !prev)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors flex-shrink-0">
              {showNewProductForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>
          {!showNewProductForm && selectedProduct && (
            <p className="mt-2 text-sm text-gray-400">
              {selectedProduct.description}
            </p>
          )}
        </div>

        {showNewProductForm && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600 space-y-3 animate-fade-in">
                <h3 className="font-semibold text-cyan-400">Add a New Product</h3>
                <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="Product Name" className="w-full p-2 bg-gray-700 border border-gray-500 rounded-md" />
                <textarea value={newProductDescription} onChange={e => setNewProductDescription(e.target.value)} placeholder="Product Description" rows={2} className="w-full p-2 bg-gray-700 border border-gray-500 rounded-md" />
                <input type="text" value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} placeholder="Product Category (e.g., Home Decor)" className="w-full p-2 bg-gray-700 border border-gray-500 rounded-md" />
                <button onClick={handleAddNewProduct} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">Save Product</button>
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Upload Main Product Image*</label>
          <div className="mt-1"><FileUpload onFilesSelect={handleMainFileSelect} imagePreviewUrl={mainImage?.previewUrl || null} /></div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300">Upload Reference Images (Optional, up to 6)</label>
            <p className="text-xs text-gray-500 mb-1">Add different angles, lifestyle shots, or close-ups.</p>
            {referenceImages.length > 0 && (
                <div className="mt-2 mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {referenceImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={image.previewUrl} alt={`Ref ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-700" />
                            <button onClick={() => handleRemoveReferenceImage(index)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {referenceImages.length < 6 && <div className="mt-1"><FileUpload onFilesSelect={handleReferenceFilesSelect} imagePreviewUrl={null} allowMultiple={true} /></div>}
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <div className="mt-2">
        <button onClick={handleNext} disabled={!mainImage || showNewProductForm} className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          Next: Creative Brief →
        </button>
      </div>
    </div>
  );
};

export default HomePage;