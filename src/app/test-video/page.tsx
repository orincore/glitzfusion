import React from 'react';

export default function TestVideo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Video Test Page</h1>
        
        <div className="bg-black rounded-xl overflow-hidden">
          <video
            controls
            autoPlay
            muted
            loop
            className="w-full h-auto"
            src="/Video assets/dancing.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300">Video path: <code className="bg-gray-700 px-2 py-1 rounded">/Video assets/dancing.mp4</code></p>
          <p className="text-gray-400 text-sm mt-2">If the video doesn't play, please check the browser's developer console for errors.</p>
        </div>
      </div>
    </div>
  );
}
