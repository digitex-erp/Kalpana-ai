import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

const FeatureListItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <li className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-700/50 rounded-full text-cyan-400 border border-gray-600">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-200">{title}</h4>
      <p className="text-gray-400">{children}</p>
    </div>
  </li>
);

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {

  return (
    <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 border-b border-gray-700 pb-4">About Kalpana AI Video Studio</h2>
        <p className="mt-4 text-gray-300">
          This application is a powerful tool designed to help creators and businesses effortlessly generate professional, narrated product videos for social media. By leveraging state-of-the-art AI models from Google, you can transform a single product image into a dynamic, ready-to-share video in minutes.
        </p>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-cyan-400">How It Works</h3>
        <ol className="list-none space-y-6">
          <FeatureListItem icon={<span className="font-bold text-lg">1</span>} title="Product Setup">
            Begin by adding your product to the local database, or select an existing one.
          </FeatureListItem>
          <FeatureListItem icon={<span className="font-bold text-lg">2</span>} title="Image Upload">
            Upload a high-quality, clear image of your product. This visual is the foundation for the entire creative process.
          </FeatureListItem>
          <FeatureListItem icon={<span className="font-bold text-lg">3</span>} title="Creative Brief">
            Define your brand identity, target audience, and desired platform. These strategic inputs guide the AI's creative decisions.
          </FeatureListItem>
          <FeatureListItem icon={<span className="font-bold text-lg">4</span>} title="Product Enrichment">
            The AI uses <strong>Google Search</strong> to analyze your product and audience, generating a rich, tailored description that you can review and edit.
          </FeatureListItem>
          <FeatureListItem icon={<span className="font-bold text-lg">5</span>} title="Music Selection">
            Choose a musical mood for your video. The AI will incorporate this direction into the storyboard's visual cues.
          </FeatureListItem>
          <FeatureListItem icon={<span className="font-bold text-lg">6</span>} title="AI Storyboarding">
            The AI generates a cinematic storyboard and script, which you can edit. You can also generate alternative "hooks" to optimize the video's opening.
          </FeatureListItem>
           <FeatureListItem icon={<span className="font-bold text-lg">7</span>} title="AI Video Generation">
            The final storyboard is used to generate a high-quality video, complete with text-to-speech narration and branded elements.
          </FeatureListItem>
        </ol>
      </div>

       <div className="space-y-6">
        <h3 className="text-xl font-semibold text-cyan-400">Technology & Best Practices</h3>
         <ul className="list-none space-y-6">
            <FeatureListItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>} 
                title="AI Models"
            >
               The magic behind this app is powered by Google's models: <strong>Gemini 2.5 Flash</strong> for vision analysis and storyboarding, and <strong>Veo</strong> for video generation.
            </FeatureListItem>
            <FeatureListItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>} 
                title="Image Quality"
            >
                The quality of the AI analysis and the final video is highly dependent on your uploaded product image. Use clear, well-lit images for the best results.
            </FeatureListItem>
             <FeatureListItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
                title="Generation Time"
            >
                Creating a video with the Veo model can take a few minutes. The app provides live status updates during this process, so please be patient.
            </FeatureListItem>
         </ul>
      </div>

      <div className="mt-4">
          <button onClick={onBack} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
              ← Back to App
          </button>
      </div>
    </div>
  );
};

export default AboutPage;