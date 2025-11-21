import React, { useState } from 'react';
import { Sparkles, Play, Code2 } from 'lucide-react';
import { generateCodeSnippet } from '../services/gemini';

const AICodeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const result = await generateCodeSnippet(prompt);
    setCode(result);
    setLoading(false);
    setPreviewKey(k => k + 1);
  };

  return (
    <div className="space-y-8">
       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl text-white shadow-lg">
         <div className="flex items-center gap-3 mb-4">
           <Sparkles className="w-6 h-6 text-yellow-300" />
           <h2 className="text-2xl font-bold">AI Tool Generator</h2>
         </div>
         <p className="mb-6 text-indigo-100">Describe a simple tool (e.g., "A digital clock", "A color palette generator", "A BMI calculator") and our AI will build it instantly.</p>
         
         <div className="flex gap-2">
           <input 
             type="text" 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="What do you want to build?"
             className="flex-1 p-4 rounded-lg text-slate-800 border-0 focus:ring-2 focus:ring-yellow-400 outline-none"
             onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
           />
           <button 
             onClick={handleGenerate} 
             disabled={loading}
             className="bg-yellow-400 text-indigo-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition disabled:opacity-50 flex items-center gap-2"
           >
             {loading ? 'Building...' : <><Play className="w-5 h-5" /> Generate</>}
           </button>
         </div>
       </div>

       {code && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
             <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
               <Code2 className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-mono text-slate-400">Source Code</span>
             </div>
             <textarea 
               value={code}
               readOnly
               className="w-full h-[400px] p-4 bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
             />
           </div>

           <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
             <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
               Live Preview
             </div>
             <div className="flex-1 relative bg-white min-h-[400px]">
               <iframe 
                 key={previewKey}
                 title="Preview"
                 className="w-full h-full absolute inset-0 border-0"
                 srcDoc={code}
                 sandbox="allow-scripts allow-same-origin"
               />
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default AICodeGenerator;