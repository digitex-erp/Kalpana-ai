import React, { useRef, useState } from 'react';
// FIX: Corrected import path for types.
import { Storyboard, Scene } from '../types';

interface StoryboardViewerProps {
  storyboard: Storyboard | null;
  onStoryboardChange: (storyboard: Storyboard) => void;
}

const StoryboardViewer: React.FC<StoryboardViewerProps> = ({ storyboard, onStoryboardChange }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  if (!storyboard) {
    return null;
  }

  const handleSceneChange = (index: number, field: keyof Scene, value: string) => {
    const newScenes = [...storyboard.scenes];
    const updatedScene = { ...newScenes[index], [field]: value };

    // When the English dialogue is edited and the Hindi field is empty,
    // update the main 'dialogue' field to match. This ensures the
    // primary narration stays consistent.
    if (field === 'dialogue_en' && !updatedScene.dialogue_hi?.trim()) {
        updatedScene.dialogue = value;
    }
    
    newScenes[index] = updatedScene;
    onStoryboardChange({ ...storyboard, scenes: newScenes });
  };
  
  const handleDuplicateScene = (index: number) => {
    const sceneToDuplicate = storyboard.scenes[index];
    const newScenes = [...storyboard.scenes];
    // Insert the duplicated scene right after the original
    newScenes.splice(index + 1, 0, { ...sceneToDuplicate }); 
    onStoryboardChange({ ...storyboard, scenes: newScenes });
  };

  const handleRemoveScene = (index: number) => {
    if (storyboard.scenes.length <= 1) {
      alert("You cannot remove the last scene.");
      return;
    }
    if (window.confirm('Are you sure you want to remove this scene?')) {
      const newScenes = storyboard.scenes.filter((_, i) => i !== index);
      onStoryboardChange({ ...storyboard, scenes: newScenes });
    }
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      visual: 'A new visual description.',
      dialogue: 'A new line of narration.',
      dialogue_en: 'A new line of narration.',
      dialogue_hi: 'नया कथन।',
      textOverlay: 'New Text',
      cameraAngle: 'Medium shot',
      transition: 'Cut to'
    };
    const newScenes = [...storyboard.scenes, newScene];
    onStoryboardChange({ ...storyboard, scenes: newScenes });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (index !== dragItem.current) {
        dragOverItem.current = index;
        setDragOverIndex(index);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  const handleDragLeave = () => {
     setDragOverIndex(null);
     dragOverItem.current = null;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
        return;
    }

    const newScenes = [...storyboard.scenes];
    const draggedItemContent = newScenes.splice(dragItem.current, 1)[0];
    newScenes.splice(dragOverItem.current, 0, draggedItemContent);
    
    onStoryboardChange({ ...storyboard, scenes: newScenes });
  };
  
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };

  return (
    <div className="space-y-4 border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold text-gray-200">{storyboard.title}</h3>
      
      {storyboard.storyArc && (
        <div className="storyboard-preview p-6 bg-gray-900/30 rounded-lg mb-6 border border-gray-700">
            {/* Story Arc Visualization */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-200">📖 Story Arc</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-400 mb-2">🎬 Act 1: Setup</p>
                        <p className="text-sm text-gray-300">{storyboard.storyArc.act1_setup}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded border-l-4 border-purple-500">
                        <p className="font-semibold text-purple-400 mb-2">⚡ Act 2: Conflict</p>
                        <p className="text-sm text-gray-300">{storyboard.storyArc.act2_conflict}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded border-l-4 border-green-500">
                        <p className="font-semibold text-green-400 mb-2">✨ Act 3: Resolution</p>
                        <p className="text-sm text-gray-300">{storyboard.storyArc.act3_resolution}</p>
                    </div>
                </div>
            </div>
            {/* Cultural Context */}
            {storyboard.culturalContext && (
                <div className="mb-6 bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
                    <h4 className="font-semibold text-yellow-300 mb-2">🪔 Cultural Context: {storyboard.culturalContext.festival || storyboard.culturalContext.tradition}</h4>
                    <p className="text-sm text-yellow-200">{storyboard.culturalContext.symbolism}</p>
                </div>
            )}
            {/* Narrative Style */}
            {storyboard.narrativeStyle && (
                 <div className="mb-2">
                    <p className="text-sm text-gray-400">
                        <strong>Narrative Style:</strong> <span className="text-gray-300">{storyboard.narrativeStyle}</span>
                    </p>
                </div>
            )}
        </div>
      )}

      <div className="space-y-4">
        {storyboard.scenes.map((scene, index) => {
            const isDragging = draggingIndex === index;
            const isDragOver = dragOverIndex === index;
            
            const emotionColor = scene.emotion === 'Trust' || scene.emotion === 'Nostalgia' || scene.emotion === 'Curiosity' ? 'border-blue-500' :
                     scene.emotion === 'Delight' || scene.emotion === 'Confidence' ? 'border-purple-500' :
                     scene.emotion === 'Joy' || scene.emotion === 'Satisfaction' || scene.emotion === 'Opportunity' ? 'border-green-500' :
                     'border-gray-600';

            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`p-4 bg-gray-900/50 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${emotionColor} ${
                    isDragging
                      ? 'opacity-50 border-dashed border-gray-500'
                      // When another item is dragged over this one, highlight it as a drop target
                      : isDragOver
                      ? 'scale-105 bg-cyan-900/30'
                      : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-grow">
                        <h4 className="font-semibold text-cyan-400 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                            Scene {index + 1}
                            {scene.emotion && <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full font-medium">{scene.emotion}</span>}
                        </h4>
                         <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2 text-gray-400">
                            {scene.cameraAngle && (
                                <div className="flex items-center gap-1.5" title="Camera Angle">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                                    <span>{scene.cameraAngle}</span>
                                </div>
                            )}
                            {scene.transition && (
                                <div className="flex items-center gap-1.5" title="Transition">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                                    <span>{scene.transition}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2 flex-shrink-0">
                        <button
                            onClick={() => handleDuplicateScene(index)}
                            className="p-1 text-gray-400 hover:text-cyan-400 rounded-full hover:bg-cyan-900/50 transition-colors"
                            title="Duplicate Scene"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375v-4.5" /></svg>
                        </button>
                        <button
                            onClick={() => handleRemoveScene(index)}
                            className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-900/50 transition-colors"
                            title="Remove Scene"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="mt-2 space-y-3">
                  <div>
                    <label htmlFor={`visual-${index}`} className="block text-sm font-medium text-gray-400">Visual Description</label>
                    <textarea
                      id={`visual-${index}`}
                      value={scene.visual}
                      onChange={(e) => handleSceneChange(index, 'visual', e.target.value)}
                      rows={2}
                      className="mt-1 w-full p-2 bg-gray-700 border border-gray-500 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`dialogue-en-${index}`} className="block text-sm font-medium text-gray-400">Narration (English)</label>
                      <textarea
                        id={`dialogue-en-${index}`}
                        value={scene.dialogue_en || scene.dialogue}
                        onChange={(e) => handleSceneChange(index, 'dialogue_en', e.target.value)}
                        rows={2}
                        className="mt-1 w-full p-2 bg-gray-700 border border-gray-500 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                      />
                    </div>
                     <div>
                      <label htmlFor={`dialogue-hi-${index}`} className="block text-sm font-medium text-gray-400">Narration (Hindi)</label>
                      <textarea
                        id={`dialogue-hi-${index}`}
                        value={scene.dialogue_hi || ''}
                        onChange={(e) => handleSceneChange(index, 'dialogue_hi', e.target.value)}
                        rows={2}
                        className="mt-1 w-full p-2 bg-gray-700 border border-gray-500 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="Creative Hindi narration..."
                      />
                    </div>
                  </div>
                   <div>
                    <label htmlFor={`text-overlay-${index}`} className="block text-sm font-medium text-gray-400">On-Screen Text Overlay</label>
                    <input
                      type="text"
                      id={`text-overlay-${index}`}
                      value={scene.textOverlay || ''}
                      onChange={(e) => handleSceneChange(index, 'textOverlay', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 border border-gray-500 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                      placeholder="Short, impactful text (3-5 words)"
                    />
                  </div>
                </div>
              </div>
            );
        })}
      </div>
      <div className="mt-4">
        <button
          onClick={handleAddScene}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 font-semibold rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors"
        >
          + Add New Scene
        </button>
      </div>
    </div>
  );
};

export default StoryboardViewer;