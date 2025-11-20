import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

interface ErrorDetails {
  icon: React.ReactNode;
  title: string;
  explanation: string;
  link?: {
    href: string;
    text: string;
  };
}

const getErrorDetails = (message: string): ErrorDetails => {
  if (message.startsWith('⚡')) {
    return {
      icon: <span className="text-2xl">⚡</span>,
      title: 'Quota Exceeded',
      explanation: 'You have exceeded the free tier or usage limits for the Google Gemini API. This can happen due to high usage.',
      link: {
        href: 'https://aistudio.google.com/app/apikey',
        text: 'Check Google AI Studio API Key & Quotas'
      }
    };
  }
  if (message.startsWith('🔑')) {
    return {
      icon: <span className="text-2xl">🔑</span>,
      title: 'Invalid API Key',
      explanation: 'The API key configured in Vercel is invalid, missing, or lacks the necessary permissions for the Gemini API.',
      link: {
        href: 'https://vercel.com/dashboard/projects',
        text: 'Check Vercel Environment Variables'
      }
    };
  }
  if (message.startsWith('🔧')) {
    return {
      icon: <span className="text-2xl">🔧</span>,
      title: 'Server Error',
      explanation: 'The backend service encountered an issue while processing the request. This is usually a temporary problem. Please check the Vercel function logs for more details.',
    };
  }
  if (message.startsWith('🌐')) {
    return {
      icon: <span className="text-2xl">🌐</span>,
      title: 'Connection Error',
      explanation: 'The application could not reach the backend AI service. Please check your network connection and ensure the Vercel deployment is active.',
    };
  }
  // Default fallback for other errors
  return {
    icon: <span className="text-2xl">⚠️</span>,
    title: 'An Error Occurred',
    explanation: message,
  };
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  const details = getErrorDetails(message);
  // Strip the emoji prefix from the original message for the details view if it's the fallback
  if (details.title === 'An Error Occurred') {
      details.explanation = message.replace(/^(⚡|🔑|🔧|🌐)\s*/, '');
  }

  return (
    <div className="p-4 bg-red-900/40 border border-red-700/60 text-red-200 rounded-lg flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">{details.icon}</div>
      <div>
        <h3 className="font-bold">{details.title}</h3>
        <p className="text-sm mt-1">{details.explanation}</p>
        {details.link && (
          <a
            href={details.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 py-1 px-3 bg-red-800/70 text-white font-semibold text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            {details.link.text} →
          </a>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;