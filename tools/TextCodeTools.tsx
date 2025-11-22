import React, { useState, useEffect, useRef, useMemo } from 'react';
import { v1, v3, v4, v5, validate } from 'uuid';
import SparkMD5 from 'spark-md5';
import { Copy, Download, RefreshCw, Check, AlertCircle, Fingerprint, Settings, Trash2, ShieldCheck, Upload, FileText, Hash, Link, FileCode, ArrowRight, Code, AlignLeft, AlignCenter, FileJson, Minimize2, Regex, List, Search, Sparkles, X } from 'lucide-react';
import beautify from 'js-beautify';

const html_beautify = beautify.html;
const css_beautify = beautify.css;
const js_beautify = beautify.js;

// --- GENERATORS ---

const UUID_NAMESPACES = {
    DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

export const UUIDGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(1);
  const [version, setVersion] = useState<'v1' | 'v3' | 'v4' | 'v5'>('v4');
  
  // v3/v5 specific
  const [namespaceMode, setNamespaceMode] = useState<string>('DNS');
  const [customNamespace, setCustomNamespace] = useState<string>('');
  const [name, setName] = useState<string>('example.com');
  
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setError('');
    setUuids([]);

    if (count < 1 || count > 1000) {
        setError('Please enter a valid quantity (1-1000).');
        return;
    }

    let namespaceToUse = '';
    if (version === 'v3' || version === 'v5') {
        if (!name.trim()) {
            setError('Name is required for v3/v5 generation.');
            return;
        }
        
        if (namespaceMode === 'Custom') {
            if (!validate(customNamespace)) {
                setError('Invalid custom namespace UUID.');
                return;
            }
            namespaceToUse = customNamespace;
        } else {
            // @ts-ignore
            namespaceToUse = UUID_NAMESPACES[namespaceMode];
        }
    }

    const newUuids: string[] = [];
    try {
        for (let i = 0; i < count; i++) {
            let id = '';
            switch (version) {
                case 'v1': id = v1(); break;
                case 'v4': id = v4(); break;
                case 'v3': id = v3(name, namespaceToUse); break;
                case 'v5': id = v5(name, namespaceToUse); break;
            }
            newUuids.push(id);
        }
        setUuids(newUuids);
    } catch (e) {
        setError('Error generating UUIDs. Please check inputs.');
    }
  };

  const handleCopy = () => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (uuids.length === 0) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setUuids([]);
    setCount(1);
    setName('example.com');
    setError('');
    setNamespaceMode('DNS');
    setCustomNamespace('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5 text-brand-600" />
            Configuration
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Version</label>
                <select 
                    value={version} 
                    onChange={(e) => setVersion(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                >
                    <option value="v4">Version 4 (Random)</option>
                    <option value="v1">Version 1 (Time-based)</option>
                    <option value="v3">Version 3 (MD5 Name)</option>
                    <option value="v5">Version 5 (SHA-1 Name)</option>
                </select>
            </div>
            
            <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                <input 
                    type="number" 
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    min="1"
                    max="1000"
                />
            </div>
            
            {(version === 'v3' || version === 'v5') && (
                <>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Namespace</label>
                        <select 
                            value={namespaceMode} 
                            onChange={(e) => setNamespaceMode(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                        >
                            <option value="DNS">DNS</option>
                            <option value="URL">URL</option>
                            <option value="OID">OID</option>
                            <option value="X500">X.500</option>
                            <option value="Custom">Custom UUID</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name Input</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="e.g. example.com"
                        />
                    </div>
                    {namespaceMode === 'Custom' && (
                        <div className="col-span-full">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Namespace UUID</label>
                             <input 
                                type="text" 
                                value={customNamespace}
                                onChange={(e) => setCustomNamespace(e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                                placeholder="00000000-0000-0000-0000-000000000000"
                            />
                        </div>
                    )}
                </>
            )}
        </div>

        {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
        )}

        <div className="flex gap-3 mt-6 border-t border-slate-100 pt-4">
            <button 
                onClick={handleGenerate} 
                className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2"
            >
                <Fingerprint className="w-5 h-5" /> Generate UUID{count > 1 ? 's' : ''}
            </button>
            <button 
                onClick={reset} 
                className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition hover:text-slate-800 border border-slate-200"
                title="Reset"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Generated {uuids.length} UUID{uuids.length !== 1 ? 's' : ''} ({version})
                 </h3>
                 <div className="flex gap-2">
                     <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 transition"
                     >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                     </button>
                     <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 transition"
                     >
                        <Download className="w-4 h-4" /> Download
                     </button>
                 </div>
             </div>

             {count === 1 ? (
                 <div className="bg-slate-900 text-green-400 font-mono text-2xl p-6 rounded-xl text-center break-all shadow-inner">
                    {uuids[0]}
                 </div>
             ) : (
                 <textarea 
                    readOnly
                    value={uuids.join('\n')}
                    className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none resize-y"
                 />
             )}
          </div>
      )}
    </div>
  );
};

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    ambiguous: false,
  });
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'Weak' | 'Fair' | 'Good' | 'Strong'>('Weak');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 3) return 'Weak';
    if (score < 4) return 'Fair';
    if (score < 5) return 'Good';
    return 'Strong';
  };

  const generate = () => {
    setError('');
    const { uppercase, lowercase, numbers, symbols, ambiguous } = options;
    
    if (!uppercase && !lowercase && !numbers && !symbols) {
        setError('Please select at least one character type.');
        setPassword('');
        return;
    }

    let chars = '';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (ambiguous) {
        // Remove I, l, 1, O, 0
        chars = chars.replace(/[Il1O0]/g, '');
    }

    if (chars.length === 0) {
        setError('No characters available with current settings.');
        return;
    }

    let pwd = '';
    // Secure random generation
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        pwd += chars[array[i] % chars.length];
    }
    
    setPassword(pwd);
    setStrength(calculateStrength(pwd));
  };

  // Initial generation
  useEffect(() => {
    generate();
  }, []);

  const handleCopy = () => {
      if (!password) return;
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      if (!password) return;
      const blob = new Blob([password], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'secure-password.txt';
      a.click();
      URL.revokeObjectURL(url);
  };

  const reset = () => {
      setLength(16);
      setOptions({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        ambiguous: false,
      });
      setError('');
      setPassword('');
      setStrength('Weak');
  };

  const getStrengthColor = () => {
      switch (strength) {
          case 'Weak': return 'text-red-600 bg-red-50 border-red-100';
          case 'Fair': return 'text-orange-600 bg-orange-50 border-orange-100';
          case 'Good': return 'text-blue-600 bg-blue-50 border-blue-100';
          case 'Strong': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Password Display */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Generated Password</div>
            <div className="relative group">
                 <div className="text-3xl md:text-4xl font-mono font-bold text-slate-800 break-all py-4 min-h-[80px] flex items-center justify-center">
                    {password || <span className="text-slate-300 italic text-lg">Click Generate</span>}
                 </div>
                 
                 {password && (
                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStrengthColor()} mb-4 transition-colors`}>
                         <ShieldCheck className="w-3 h-3" />
                         {strength} Password
                     </div>
                 )}
            </div>

            <div className="flex justify-center gap-3 mt-2">
                 <button 
                    onClick={handleCopy}
                    disabled={!password}
                    className="flex items-center gap-2 bg-brand-50 text-brand-700 hover:bg-brand-100 px-6 py-2 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                 </button>
                 <button 
                    onClick={generate}
                    className="flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-6 py-2 rounded-full font-medium transition shadow-lg hover:shadow-brand-200"
                 >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                 </button>
                 <button 
                    onClick={handleDownload}
                    disabled={!password}
                    className="flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-full font-medium transition disabled:opacity-50"
                    title="Download as .txt"
                 >
                    <Download className="w-4 h-4" />
                 </button>
            </div>
        </div>

        {/* Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg border-b border-slate-100 pb-4">
                <Settings className="w-5 h-5 text-brand-600" />
                Password Settings
            </div>

            <div className="space-y-8">
                {/* Length */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-slate-700">Password Length</label>
                        <span className="text-2xl font-bold text-brand-600 font-mono">{length}</span>
                    </div>
                    <input 
                        type="range" 
                        min="4" 
                        max="64" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                        <span>4</span>
                        <span>64</span>
                    </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input 
                            type="checkbox" 
                            checked={options.uppercase} 
                            onChange={() => toggleOption('uppercase')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Uppercase (A-Z)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input 
                            type="checkbox" 
                            checked={options.lowercase} 
                            onChange={() => toggleOption('lowercase')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Lowercase (a-z)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input 
                            type="checkbox" 
                            checked={options.numbers} 
                            onChange={() => toggleOption('numbers')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Numbers (0-9)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input 
                            type="checkbox" 
                            checked={options.symbols} 
                            onChange={() => toggleOption('symbols')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Symbols (!@#$)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition sm:col-span-2 md:col-span-1">
                        <input 
                            type="checkbox" 
                            checked={options.ambiguous} 
                            onChange={() => toggleOption('ambiguous')}
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Avoid Ambiguous (I, l, 1, O, 0)</span>
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
                
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                        onClick={reset} 
                        className="text-sm text-slate-400 hover:text-slate-600 transition flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export const LoremIpsum: React.FC = () => {
  const [count, setCount] = useState(5);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", 
    "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut", "enim", "ad", "minim", 
    "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", 
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", 
    "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", 
    "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", 
    "id", "est", "laborum"
  ];

  const generateWords = (num: number, capitalizeFirst = false) => {
     const result = [];
     for(let i=0; i<num; i++) {
        result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
     }
     if(capitalizeFirst && result.length > 0) {
        result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
     }
     return result.join(' ');
  };

  const generateSentence = () => {
      const length = Math.floor(Math.random() * 10) + 8; 
      return generateWords(length, true) + '.';
  };

  const generateParagraph = () => {
      const length = Math.floor(Math.random() * 5) + 3; 
      const sentences = [];
      for(let i=0; i<length; i++) sentences.push(generateSentence());
      return sentences.join(' ');
  };

  const generate = () => {
      let text = '';
      
      if (type === 'paragraphs') {
          const paras = [];
          for(let i=0; i<count; i++) paras.push(generateParagraph());
          text = paras.join('\n\n');
      } else if (type === 'sentences') {
          const sentences = [];
          for(let i=0; i<count; i++) sentences.push(generateSentence());
          text = sentences.join(' ');
      } else {
          text = generateWords(count, true);
      }

      if (startWithLorem) {
          const standard = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
          
          if (type === 'words') {
               const words = text.split(' ');
               const standardWordsDisplay = standard.replace(/[.,]/g, '').split(' ');
               
               if (count <= standardWordsDisplay.length) {
                   text = standardWordsDisplay.slice(0, count).join(' ');
               } else {
                   text = [...standardWordsDisplay, ...words.slice(standardWordsDisplay.length)].join(' ');
               }
          } else {
               const parts = text.split('.');
               if (parts.length > 0) {
                   parts[0] = standard;
                   text = parts.join('.');
               } else {
                   text = standard;
               }
          }
      }
      setOutput(text);
  };

  useEffect(() => {
      generate();
  }, []);

  const handleCopy = () => {
      if (!output) return;
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      if (!output) return;
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lorem-ipsum.txt';
      a.click();
      URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 border-b border-slate-100 pb-6">
               <div className="flex items-center gap-2">
                   <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                        <FileText className="w-6 h-6" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800">Generator Settings</h2>
               </div>

               <div className="flex flex-wrap gap-4 items-end">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                       <div className="flex bg-slate-100 p-1 rounded-lg">
                           {(['paragraphs', 'sentences', 'words'] as const).map(t => (
                               <button
                                 key={t}
                                 onClick={() => setType(t)}
                                 className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition ${type === t ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                               >
                                 {t}
                               </button>
                           ))}
                       </div>
                   </div>
                   
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Count</label>
                       <input 
                         type="number" 
                         min="1" 
                         max="1000" 
                         value={count} 
                         onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                         className="w-24 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-center"
                       />
                   </div>
               </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-6">
               <label className="flex items-center gap-2 cursor-pointer select-none">
                   <input 
                     type="checkbox" 
                     checked={startWithLorem} 
                     onChange={(e) => setStartWithLorem(e.target.checked)}
                     className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                   />
                   <span className="text-slate-700 font-medium">Start with "Lorem ipsum..."</span>
               </label>

               <div className="flex-1 flex justify-end gap-2">
                    <button 
                        onClick={generate}
                        className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Generate
                    </button>
                    <button 
                        onClick={() => { setCount(5); setType('paragraphs'); setStartWithLorem(true); }}
                        className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition font-medium"
                        title="Reset Defaults"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
               </div>
           </div>
       </div>

       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
           <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-700">Generated Text</h3>
               <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
               </div>
           </div>
           
           <textarea 
             readOnly
             value={output}
             className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed resize-y focus:outline-none"
           />
       </div>
    </div>
  );
};

// --- TRANSFORMERS ---
export const TextCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const transform = (type: string) => {
    if (!input) return;
    let res = input;
    
    switch (type) {
      case 'upper':
        res = res.toUpperCase();
        break;
      case 'lower':
        res = res.toLowerCase();
        break;
      case 'sentence':
        res = res.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        break;
      case 'capitalize': // Capitalize Each Word
        res = res.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'title': // Title Case (Exclude minor words)
        const minor = ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'out', 'over', 'up', 'to', 'with', 'as'];
        res = res.toLowerCase().replace(/\b\w+/g, (w, index, str) => {
             // Check previous char to see if it is sentence start (rough check)
             const isFirst = index === 0 || /[\.\!\?]\s*$/.test(str.slice(0, index));
             if (!isFirst && minor.includes(w)) return w;
             return w.charAt(0).toUpperCase() + w.slice(1);
        });
        break;
      case 'toggle':
        res = res.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        break;
      case 'camel':
        // Replace all non-alphanumeric separators with space, trim
        res = res.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
        res = res.split(' ').map((w, i) => {
             w = w.toLowerCase();
             if (i === 0) return w;
             return w.charAt(0).toUpperCase() + w.slice(1);
        }).join('');
        break;
      case 'pascal':
        res = res.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
        res = res.split(' ').map(w => {
             w = w.toLowerCase();
             return w.charAt(0).toUpperCase() + w.slice(1);
        }).join('');
        break;
      case 'snake':
        res = res.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').join('_').toLowerCase();
        break;
      case 'kebab':
        res = res.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').join('-').toLowerCase();
        break;
      case 'clean':
        res = res.replace(/\s+/g, ' ').trim();
        break;
      case 'first':
        res = res.charAt(0).toUpperCase() + res.slice(1);
        break;
    }
    setOutput(res);
  };

  // Stats
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
      <div className="max-w-5xl mx-auto space-y-6">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex justify-between mb-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Input Text</label>
                   <div className="text-xs text-slate-400 flex gap-3">
                       <span>{wordCount} Words</span>
                       <span>{charCount} Characters</span>
                   </div>
               </div>
               <textarea 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none h-40 resize-y text-slate-700"
                   placeholder="Type or paste your text here..."
               />
               <div className="flex justify-end mt-2">
                    <button onClick={() => {setInput(''); setOutput('')}} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear Input</button>
               </div>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button onClick={() => transform('upper')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">UPPERCASE</button>
               <button onClick={() => transform('lower')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">lowercase</button>
               <button onClick={() => transform('sentence')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">Sentence case</button>
               <button onClick={() => transform('capitalize')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">Capitalize Word</button>
               
               <button onClick={() => transform('title')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">Title Case</button>
               <button onClick={() => transform('toggle')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">tOGGLE cASE</button>
               <button onClick={() => transform('camel')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">camelCase</button>
               <button onClick={() => transform('pascal')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">PascalCase</button>
               
               <button onClick={() => transform('snake')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">snake_case</button>
               <button onClick={() => transform('kebab')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">kebab-case</button>
               <button onClick={() => transform('clean')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">Remove Extra Spaces</button>
               <button onClick={() => transform('first')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 font-medium text-sm shadow-sm transition">First Letter Upper</button>
          </div>

          {/* Output Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex justify-between mb-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Result</label>
                   <div className="flex gap-2">
                       <button 
                          onClick={handleCopy}
                          disabled={!output}
                          className="flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition disabled:opacity-50"
                       >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                       </button>
                       <button 
                          onClick={handleDownload}
                          disabled={!output}
                          className="flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition disabled:opacity-50"
                       >
                          <Download className="w-3 h-3" /> Download
                       </button>
                       <button 
                          onClick={() => setOutput('')}
                          disabled={!output}
                          className="flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded text-slate-600 transition disabled:opacity-50"
                       >
                          <Trash2 className="w-3 h-3" /> Clear
                       </button>
                   </div>
               </div>
               <textarea 
                   readOnly
                   value={output}
                   className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none h-40 resize-y text-slate-700"
                   placeholder="Result will appear here..."
               />
          </div>
      </div>
  );
};

export const WordCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
      if (!text) return {
          words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, lines: 0, readingTime: 0, speakingTime: 0
      };

      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const charsNoSpaces = text.replace(/\s/g, '').length;
      const lines = text.split(/\r\n|\r|\n/).length;
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      
      return {
          words,
          chars,
          charsNoSpaces,
          lines,
          paragraphs: Math.max(paragraphs, words > 0 ? 1 : 0),
          sentences: Math.max(sentences, words > 0 ? 1 : 0), // At least 1 sentence if there are words, usually
          readingTime: Math.ceil(words / 225), // Avg silent reading
          speakingTime: Math.ceil(words / 130)  // Avg speaking
      };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-content.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => setText('');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Words</div>
               <div className="text-3xl font-extrabold text-brand-600">{stats.words}</div>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Characters</div>
               <div className="text-3xl font-extrabold text-slate-700">{stats.chars}</div>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sentences</div>
               <div className="text-3xl font-extrabold text-slate-700">{stats.sentences}</div>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paragraphs</div>
               <div className="text-3xl font-extrabold text-slate-700">{stats.paragraphs}</div>
           </div>
       </div>

       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
               <label className="text-xs font-bold text-slate-500 uppercase">Input Text</label>
               <div className="flex gap-2">
                   <button onClick={handleCopy} disabled={!text} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition font-medium disabled:opacity-50">
                       {copied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>} {copied ? 'Copied' : 'Copy'}
                   </button>
                   <button onClick={handleDownload} disabled={!text} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition font-medium disabled:opacity-50">
                       <Download className="w-3 h-3"/> Save
                   </button>
                   <button onClick={handleClear} disabled={!text} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded transition font-medium disabled:opacity-50">
                       <Trash2 className="w-3 h-3"/> Clear
                   </button>
               </div>
           </div>
           <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               className="w-full p-4 h-64 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y text-slate-700 leading-relaxed"
               placeholder="Start typing or paste your text here..."
           />
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Reading Time</span>
                <span className="font-bold text-slate-700">~{stats.readingTime} min</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Speaking Time</span>
                <span className="font-bold text-slate-700">~{stats.speakingTime} min</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Lines</span>
                <span className="font-bold text-slate-700">{stats.lines}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Chars (no space)</span>
                <span className="font-bold text-slate-700">{stats.charsNoSpaces}</span>
            </div>
       </div>
    </div>
  );
}

export const RemoveLineBreaks: React.FC = () => {
    const [text, setText] = useState('');
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <textarea value={text} onChange={e=>setText(e.target.value)} className="p-3 border rounded h-48" placeholder="Input text..."/>
            <textarea readOnly value={text.replace(/(\r\n|\n|\r)/gm, " ")} className="p-3 border rounded h-48 bg-slate-50" placeholder="Result..."/>
        </div>
    )
}

// --- CODE TOOLS ---

export const CodeMinifier: React.FC<{lang: 'html'|'css'|'js'}> = ({lang}) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [stats, setStats] = useState<{orig: number, min: number, percent: number} | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    
    // Options
    const [preserveComments, setPreserveComments] = useState(false);
    const [preserveLines, setPreserveLines] = useState(false);

    const handleMinify = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            let res = input;

            const processCSS = (css: string) => {
                let c = css;
                if (!preserveComments) {
                    c = c.replace(/\/\*[\s\S]*?\*\//g, "");
                }
                c = c.replace(/\s+/g, " ");
                c = c.replace(/\s*([{}:;,])\s*/g, "$1");
                c = c.replace(/;}/g, "}");
                return c.trim();
            };

            if (lang === 'css') {
                const openBraces = (res.match(/{/g) || []).length;
                const closeBraces = (res.match(/}/g) || []).length;
                if (openBraces !== closeBraces) {
                    setError(`Warning: Mismatched braces detected (Opening: ${openBraces}, Closing: ${closeBraces}). The minified code might be invalid.`);
                }
                res = processCSS(res);
            } else if (lang === 'html') {
                if (!preserveComments) {
                    res = res.replace(/<!--[\s\S]*?-->/g, "");
                }
                
                if (preserveLines) {
                     res = res.split('\n').map(l => l.trim()).filter(l => l).join('\n');
                } else {
                     res = res.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, start, css, end) => start + processCSS(css) + end);
                     res = res.replace(/[\r\n\t]+/g, ' ');
                     res = res.replace(/\s+/g, " ");
                     res = res.replace(/>\s+</g, "><");
                }
            } else if (lang === 'js') {
                 // Use Terser for robust JS minification via dynamic import
                 // @ts-ignore
                 const { minify } = await import('terser');
                 
                 const options = {
                     mangle: true,
                     compress: true,
                     format: {
                         comments: preserveComments ? 'all' : false
                     }
                 };
                 
                 const result = await minify(input, options);
                 if (result.code) {
                     res = result.code;
                 } else {
                     throw new Error("Minification resulted in empty output.");
                 }
            }
            
            res = res.trim();
            
            setOutput(res);
            setStats({
                orig: input.length,
                min: res.length,
                percent: input.length > 0 ? Math.round((1 - res.length / input.length) * 100) : 0
            });
        } catch (err: any) {
            console.error(err);
            const msg = err.message ? err.message.replace(/\n/g, ' ') : "Syntax Error or Minification failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `minified.${lang}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setInput('');
        setOutput('');
        setStats(null);
        setError('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                            <FileCode className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{lang.toUpperCase()} Minifier</h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={preserveComments} 
                                onChange={(e) => setPreserveComments(e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                            />
                            Preserve Comments
                        </label>
                        {lang === 'html' && (
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={preserveLines} 
                                    onChange={(e) => setPreserveLines(e.target.checked)}
                                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                                />
                                Preserve Line Breaks
                            </label>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                     {/* Input */}
                     <div className="flex flex-col h-full">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Input Code</label>
                            <span className="text-xs text-slate-400">{input.length} chars</span>
                        </div>
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            className="flex-1 p-4 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" 
                            placeholder={`Paste your ${lang.toUpperCase()} code here...`}
                        />
                     </div>

                     {/* Output */}
                     <div className="flex flex-col h-full">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Minified Output</label>
                            <div className="flex gap-4 text-xs">
                                {stats && (
                                    <>
                                        <span className="text-slate-600">{stats.min} chars</span>
                                        <span className="text-green-600 font-bold">-{stats.percent}% saved</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <textarea 
                            readOnly 
                            value={output} 
                            className="flex-1 p-4 border border-slate-200 bg-slate-50 rounded-xl font-mono text-xs focus:outline-none resize-none text-slate-700" 
                            placeholder="Minified code will appear here..."
                        />
                     </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button 
                        onClick={handleMinify} 
                        disabled={!input || loading}
                        className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        {loading ? 'Minifying...' : 'Minify Code'}
                    </button>
                    <button 
                        onClick={handleCopy}
                        disabled={!output}
                        className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={!output}
                        className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={reset}
                        className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition border border-slate-200"
                        title="Clear"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export const CodeBeautifier: React.FC<{lang: 'html'|'css'|'js'}> = ({lang}) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<{orig: number, beaut: number} | null>(null);
    
    // Options
    const [indentSize, setIndentSize] = useState(4);
    const [preserveNewlines, setPreserveNewlines] = useState(true);
    const [indentWithTabs, setIndentWithTabs] = useState(false);
    const [preserveComments, setPreserveComments] = useState(true);
    const [preserveInline, setPreserveInline] = useState(true); // HTML specific

    const handleBeautify = async () => {
        if (!input.trim()) {
            setError('Please enter some code to beautify.');
            return;
        }
        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            let codeToFormat = input;

            if (!preserveComments) {
                 if (lang === 'css') {
                     codeToFormat = codeToFormat.replace(/\/\*[\s\S]*?\*\//g, "");
                 } else if (lang === 'html') {
                     codeToFormat = codeToFormat.replace(/<!--[\s\S]*?-->/g, "");
                 } else if (lang === 'js') {
                     codeToFormat = codeToFormat.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
                 }
            }

            if (lang === 'css') {
                const open = (codeToFormat.match(/{/g) || []).length;
                const close = (codeToFormat.match(/}/g) || []).length;
                if (open !== close) {
                    setError(`Warning: Mismatched braces detected (Opening: ${open}, Closing: ${close}). Result may be invalid.`);
                }
            }

            let res = '';
            const opts = {
                indent_size: indentWithTabs ? 1 : indentSize,
                indent_char: indentWithTabs ? '\t' : ' ',
                max_preserve_newlines: preserveNewlines ? 2 : 0,
                preserve_newlines: preserveNewlines,
                indent_scripts: 'normal',
                end_with_newline: true,
                selector_separator_newline: true,
                newline_between_rules: true,
                inline: preserveInline ? undefined : []
            };

            if (lang === 'html') {
                res = html_beautify(codeToFormat, opts);
            } else if (lang === 'css') {
                res = css_beautify(codeToFormat, opts);
            } else if (lang === 'js') {
                res = js_beautify(codeToFormat, opts);
            }

            setOutput(res);
            setStats({ orig: input.length, beaut: res.length });
        } catch (err: any) {
            console.error(err);
            setError('Error beautifying code. Please check input validity or library availability.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beautified.${lang}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setInput('');
        setOutput('');
        setError('');
        setStats(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                            <Code className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{lang.toUpperCase()} Beautifier</h2>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <AlignLeft className="w-4 h-4 ml-2 text-slate-400" />
                            <select 
                                value={indentWithTabs ? 'tab' : indentSize}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === 'tab') {
                                        setIndentWithTabs(true);
                                    } else {
                                        setIndentWithTabs(false);
                                        setIndentSize(parseInt(v));
                                    }
                                }}
                                className="bg-transparent border-none text-slate-700 text-xs font-medium focus:ring-0 cursor-pointer"
                            >
                                <option value="2">2 Spaces</option>
                                <option value="4">4 Spaces</option>
                                <option value="8">8 Spaces</option>
                                <option value="tab">Tabs</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={preserveNewlines} 
                                onChange={(e) => setPreserveNewlines(e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                            />
                            Preserve Newlines
                        </label>
                        
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={preserveComments} 
                                onChange={(e) => setPreserveComments(e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                            />
                            Preserve Comments
                        </label>

                        {lang === 'html' && (
                             <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none" title="Keep inline elements like <span> or <a> on the same line">
                                <input 
                                    type="checkbox" 
                                    checked={preserveInline} 
                                    onChange={(e) => setPreserveInline(e.target.checked)}
                                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                                />
                                Preserve Inline Tags
                            </label>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                     {/* Input */}
                     <div className="flex flex-col h-full">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Input Code</label>
                            <span className="text-xs text-slate-400">{input.length} chars</span>
                        </div>
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            className="flex-1 p-4 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" 
                            placeholder={`Paste your ${lang.toUpperCase()} code here...`}
                        />
                     </div>

                     {/* Output */}
                     <div className="flex flex-col h-full">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Beautified Output</label>
                            <div className="flex gap-4 text-xs">
                                {stats && (
                                    <>
                                        <span className="text-slate-600">{stats.beaut} chars</span>
                                        <span className={`font-bold ${stats.beaut > stats.orig ? 'text-orange-600' : 'text-green-600'}`}>
                                            {stats.beaut > stats.orig ? '+' : ''}{Math.round(((stats.beaut - stats.orig) / stats.orig) * 100)}% size
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <textarea 
                            readOnly 
                            value={output} 
                            className="flex-1 p-4 border border-slate-200 bg-slate-50 rounded-xl font-mono text-xs focus:outline-none resize-none text-slate-700" 
                            placeholder="Formatted code will appear here..."
                        />
                     </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button 
                        onClick={handleBeautify} 
                        disabled={!input || loading}
                        className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Code className="w-5 h-5" />}
                        {loading ? 'Formatting...' : 'Beautify Code'}
                    </button>
                    <button 
                        onClick={handleCopy}
                        disabled={!output}
                        className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={!output}
                        className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={reset}
                        className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition border border-slate-200"
                        title="Clear"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | 'tab'>(2);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string>('data.json');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setInput(ev.target.result as string);
          setError(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const processJson = (mode: 'format' | 'minify') => {
    if (!input.trim()) {
        setError('Please enter JSON to process');
        return;
    }
    try {
      const parsed = JSON.parse(input);
      let res = '';
      if (mode === 'minify') {
        res = JSON.stringify(parsed);
      } else {
        res = JSON.stringify(parsed, null, indent === 'tab' ? '\t' : indent);
      }
      setOutput(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.startsWith('formatted-') ? fileName : `formatted-${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setFileName('data.json');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Calculate size stats
  const inputSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                      <FileJson className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">JSON Formatter & Validator</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                  {/* File Upload */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 font-medium transition"
                  >
                    <Upload className="w-4 h-4" /> Upload File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json,application/json" />

                  {/* Indent Select */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <select 
                        value={indent} 
                        onChange={(e) => setIndent(e.target.value === 'tab' ? 'tab' : Number(e.target.value))}
                        className="bg-transparent border-none text-sm text-slate-700 font-medium focus:ring-0 cursor-pointer p-0"
                      >
                          <option value={2}>2 Spaces</option>
                          <option value={4}>4 Spaces</option>
                          <option value={8}>8 Spaces</option>
                          <option value="tab">Tabs</option>
                      </select>
                  </div>
              </div>
          </div>

          {/* Error Display */}
          {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-medium font-mono">{error}</span>
              </div>
          )}

          {/* Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              {/* Input */}
              <div className="flex flex-col h-full">
                  <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Input JSON</label>
                      <span className="text-xs text-slate-400">{inputSize > 0 ? `${(inputSize/1024).toFixed(2)} KB` : '0 KB'}</span>
                  </div>
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 p-4 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-slate-700"
                      placeholder='Paste your JSON here...'
                      spellCheck={false}
                  />
              </div>

              {/* Output */}
              <div className="flex flex-col h-full">
                  <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Formatted Output</label>
                      <span className="text-xs text-slate-400">{outputSize > 0 ? `${(outputSize/1024).toFixed(2)} KB` : '0 KB'}</span>
                  </div>
                  <textarea 
                      readOnly
                      value={output}
                      className="flex-1 p-4 border border-slate-200 bg-slate-50 rounded-xl font-mono text-xs focus:outline-none resize-none text-slate-700"
                      placeholder='Processed JSON will appear here...'
                      spellCheck={false}
                  />
              </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
              <button 
                  onClick={() => processJson('format')} 
                  className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2"
              >
                  <AlignLeft className="w-5 h-5" /> Format / Beautify
              </button>
              <button 
                  onClick={() => processJson('minify')} 
                  className="px-6 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition shadow-md font-medium flex items-center gap-2"
              >
                  <Minimize2 className="w-5 h-5" /> Minify
              </button>
              
              <div className="w-px h-10 bg-slate-200 mx-2 hidden md:block"></div>

              <button 
                  onClick={handleCopy}
                  disabled={!output}
                  className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
              </button>
              <button 
                  onClick={handleDownload}
                  disabled={!output}
                  className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                  <Download className="w-4 h-4" />
              </button>
              <button 
                  onClick={handleClear}
                  className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition border border-slate-200"
                  title="Clear All"
              >
                  <Trash2 className="w-5 h-5" />
              </button>
          </div>
       </div>
    </div>
  );
};

export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError('');
    if (!input) {
        setOutput('');
        return;
    }
    try {
        if (mode === 'encode') {
            setOutput(encodeURIComponent(input));
        } else {
            setOutput(decodeURIComponent(input));
        }
    } catch (e) {
        setError('Invalid URL encoded text detected.');
        setOutput('');
    }
  }, [input, mode]);

  const handleCopy = () => {
      if (!output) return;
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      if (!output) return;
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `url-${mode}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                    <Link className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">URL Encoder / Decoder</h2>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('encode')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'encode' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Encode
                </button>
                <button 
                    onClick={() => setMode('decode')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'decode' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Decode
                </button>
            </div>
         </div>

         {/* Input Area */}
         <div className="mb-6">
            <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Input {mode === 'decode' ? 'Encoded URL' : 'Text / URL'}</label>
                <span className="text-xs text-slate-400">{input.length} chars</span>
            </div>
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-y text-slate-700 placeholder:text-slate-300"
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL encoded string to decode...'}
            />
         </div>

         {/* Error Message */}
         {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
         )}

         {/* Output Area */}
         <div className="mb-6 relative">
            <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Output Result</label>
                <span className="text-xs text-slate-400">{output.length} chars</span>
            </div>
            <textarea 
                readOnly
                value={output}
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none resize-y font-mono text-sm"
                placeholder="Result will appear here..."
            />
         </div>

         {/* Actions */}
         <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <button 
                onClick={handleCopy}
                disabled={!output}
                className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Result'}
            </button>
            <button 
                onClick={handleDownload}
                disabled={!output}
                className="px-6 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4" /> Download
            </button>
            <button 
                onClick={() => { setInput(''); setOutput(''); setError(''); }}
                className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition border border-slate-200"
                title="Clear Input"
            >
                <Trash2 className="w-5 h-5" />
            </button>
         </div>
    </div>
  );
}

export const MD5Generator: React.FC = () => {
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [hash, setHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileInput(e.target.files[0]);
            setHash('');
            setError('');
        }
    };

    const calculateHash = async () => {
        setLoading(true);
        setError('');
        setHash('');
        
        try {
            if (mode === 'text') {
                if (!textInput) {
                    setError('Please enter text to hash.');
                    setLoading(false);
                    return;
                }
                setHash(SparkMD5.hash(textInput));
            } else {
                if (!fileInput) {
                    setError('Please select a file to hash.');
                    setLoading(false);
                    return;
                }
                
                // Use FileReader + SparkMD5.ArrayBuffer for files
                const fileReader = new FileReader();
                
                fileReader.onload = function (e) {
                    if (e.target?.result) {
                        const spark = new SparkMD5.ArrayBuffer();
                        spark.append(e.target.result as ArrayBuffer);
                        setHash(spark.end());
                        setLoading(false);
                    } else {
                        setError("Error reading file.");
                        setLoading(false);
                    }
                };

                fileReader.onerror = function () {
                    setError("Error reading file.");
                    setLoading(false);
                };

                fileReader.readAsArrayBuffer(fileInput);
                // Return early to wait for callback
                return;
            }
        } catch (err) {
            setError('Error calculating MD5 hash.');
            console.error(err);
        }
        setLoading(false);
    };

    const reset = () => {
        setTextInput('');
        setFileInput(null);
        setHash('');
        setError('');
        setCopied(false);
    };

    const handleCopy = () => {
        if (hash) {
            navigator.clipboard.writeText(hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (hash) {
            const blob = new Blob([hash], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'md5-hash.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {/* Mode Selector */}
                <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
                    <button 
                        onClick={() => { setMode('text'); reset(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${mode === 'text' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileText className="w-4 h-4" /> Text String
                    </button>
                    <button 
                        onClick={() => { setMode('file'); reset(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${mode === 'file' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Upload className="w-4 h-4" /> File Upload
                    </button>
                </div>

                {/* Inputs */}
                <div className="mb-6">
                    {mode === 'text' ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Input Text</label>
                            <textarea 
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-y"
                                placeholder="Enter text to hash..."
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="font-medium text-slate-700">
                                        {fileInput ? fileInput.name : "Click or drag file here"}
                                    </p>
                                    {fileInput && <p className="text-xs text-slate-400 mt-1">{(fileInput.size / 1024).toFixed(2)} KB</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button 
                        onClick={calculateHash} 
                        disabled={loading}
                        className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Hash className="w-5 h-5" />}
                        {loading ? 'Generating...' : `Generate MD5 Hash`}
                    </button>
                    <button 
                        onClick={reset} 
                        className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200"
                        title="Reset"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Results */}
            {hash && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" /> MD5 Hash Generated
                        </h3>
                        <div className="text-xs text-slate-400 font-mono">{hash.length} chars</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm break-all text-slate-700 mb-4">
                        {hash}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Hash'}
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            <Download className="w-4 h-4" /> Download .txt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export const HashGenerator: React.FC<{type: string}> = ({type}) => {
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [hash, setHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileInput(e.target.files[0]);
            setHash('');
            setError('');
        }
    };

    const calculateHash = async () => {
        setLoading(true);
        setError('');
        setHash('');
        
        try {
            let buffer: ArrayBuffer;
            
            if (mode === 'text') {
                if (!textInput) {
                    setError('Please enter text to hash.');
                    setLoading(false);
                    return;
                }
                const encoder = new TextEncoder();
                buffer = encoder.encode(textInput);
            } else {
                if (!fileInput) {
                    setError('Please select a file to hash.');
                    setLoading(false);
                    return;
                }
                buffer = await fileInput.arrayBuffer();
            }

            const hashBuffer = await crypto.subtle.digest(type, buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            setHash(hashHex);
        } catch (err) {
            setError('Error calculating hash. This browser might not support the selected algorithm natively.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setTextInput('');
        setFileInput(null);
        setHash('');
        setError('');
        setCopied(false);
    };

    const handleCopy = () => {
        if (hash) {
            navigator.clipboard.writeText(hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (hash) {
            const blob = new Blob([hash], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type.toLowerCase()}-hash.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {/* Mode Selector */}
                <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
                    <button 
                        onClick={() => { setMode('text'); reset(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${mode === 'text' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileText className="w-4 h-4" /> Text String
                    </button>
                    <button 
                        onClick={() => { setMode('file'); reset(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${mode === 'file' ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Upload className="w-4 h-4" /> File Upload
                    </button>
                </div>

                {/* Inputs */}
                <div className="mb-6">
                    {mode === 'text' ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Input Text</label>
                            <textarea 
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-y"
                                placeholder="Enter text to hash..."
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="font-medium text-slate-700">
                                        {fileInput ? fileInput.name : "Click or drag file here"}
                                    </p>
                                    {fileInput && <p className="text-xs text-slate-400 mt-1">{(fileInput.size / 1024).toFixed(2)} KB</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button 
                        onClick={calculateHash} 
                        disabled={loading}
                        className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Hash className="w-5 h-5" />}
                        {loading ? 'Generating...' : `Generate ${type} Hash`}
                    </button>
                    <button 
                        onClick={reset} 
                        className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border border-slate-200"
                        title="Reset"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Results */}
            {hash && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" /> Hash Generated
                        </h3>
                        <div className="text-xs text-slate-400 font-mono">{hash.length} chars</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm break-all text-slate-700 mb-4">
                        {hash}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Hash'}
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            <Download className="w-4 h-4" /> Download .txt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState(String.raw`\b\w{4,}\b`);
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [inputText, setInputText] = useState('The quick brown fox jumps over the lazy dog.');
  const [matches, setMatches] = useState<RegExpExecArray[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Execute Regex and find matches
  useEffect(() => {
    try {
      if (!pattern) {
          setMatches([]);
          setError('');
          return;
      }
      
      let flagStr = '';
      if (flags.g) flagStr += 'g';
      if (flags.i) flagStr += 'i';
      if (flags.m) flagStr += 'm';
      if (flags.s) flagStr += 's';

      const regex = new RegExp(pattern, flagStr);
      const newMatches: RegExpExecArray[] = [];

      if (flags.g) {
          let match;
          // Safety mechanism: limit matches to prevent freezing browser on catostrophic backtracking or infinite loops
          let iterations = 0;
          while ((match = regex.exec(inputText)) !== null) {
              newMatches.push(match);
              if (match.index === regex.lastIndex) {
                  regex.lastIndex++;
              }
              iterations++;
              if (iterations > 2000) break;
          }
      } else {
          const match = regex.exec(inputText);
          if (match) newMatches.push(match);
      }
      
      setMatches(newMatches);
      setError('');
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
    }
  }, [pattern, flags, inputText]);

  const toggleFlag = (key: keyof typeof flags) => {
      setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderHighlightedText = () => {
      if (error || !pattern || matches.length === 0) return <span className="text-slate-700">{inputText}</span>;

      const parts = [];
      let lastIndex = 0;

      matches.forEach((match, i) => {
          const start = match.index;
          const end = start + match[0].length;

          if (start > lastIndex) {
              parts.push(<span key={`text-${i}`}>{inputText.slice(lastIndex, start)}</span>);
          }

          parts.push(
              <mark key={`match-${i}`} className="bg-yellow-200 text-slate-900 rounded-sm px-0 border-b-2 border-yellow-400 font-medium">
                  {match[0]}
              </mark>
          );
          lastIndex = end;
      });

      if (lastIndex < inputText.length) {
          parts.push(<span key="text-end">{inputText.slice(lastIndex)}</span>);
      }

      return <div className="whitespace-pre-wrap break-words font-mono text-sm leading-6">{parts}</div>;
  };

  const handleCopyMatches = () => {
      const text = matches.map(m => m[0]).join('\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             {/* Header */}
             <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <Regex className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Regex Tester</h2>
                    <p className="text-xs text-slate-500">Test and debug regular expressions</p>
                </div>
             </div>

             {/* Controls */}
             <div className="grid md:grid-cols-3 gap-6 mb-6">
                 <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Regular Expression</label>
                     <div className="relative flex items-center">
                         <span className="absolute left-3 text-slate-400 font-mono text-lg">/</span>
                         <input 
                             type="text" 
                             value={pattern}
                             onChange={(e) => setPattern(e.target.value)}
                             className={`w-full pl-6 pr-12 py-3 border rounded-lg font-mono text-slate-800 focus:ring-2 focus:outline-none ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-brand-500'}`}
                             placeholder="\b\w+\b"
                         />
                         <span className="absolute right-3 text-slate-400 font-mono text-lg">/</span>
                     </div>
                     {error && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</div>}
                 </div>
                 
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flags</label>
                     <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {Object.entries(flags).map(([key, active]) => (
                            <button 
                                key={key}
                                onClick={() => toggleFlag(key as any)}
                                className={`px-3 py-1 rounded text-sm font-mono font-bold transition ${active ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
                                title={key === 'g' ? 'Global' : key === 'i' ? 'Case Insensitive' : key === 'm' ? 'Multiline' : 'Dot All'}
                            >
                                {key}
                            </button>
                        ))}
                     </div>
                 </div>
             </div>

             {/* Main Workspace */}
             <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                 {/* Input */}
                 <div className="flex flex-col h-full">
                     <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Test String</label>
                     </div>
                     <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none font-mono text-sm leading-6"
                        placeholder="Enter test text here..."
                     />
                 </div>

                 {/* Output */}
                 <div className="flex flex-col h-full relative">
                     <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Result & Highlights</label>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                {matches.length} Match{matches.length !== 1 ? 'es' : ''}
                             </span>
                        </div>
                     </div>
                     
                     <div className="flex-1 w-full p-4 border border-slate-200 bg-slate-50 rounded-xl overflow-y-auto">
                         {renderHighlightedText()}
                     </div>
                 </div>
             </div>
            
            {/* Bottom Panel */}
             <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col md:flex-row gap-6">
                 <div className="flex-1">
                     <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <List className="w-4 h-4" /> Match Details
                     </h4>
                     <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto p-2">
                         {matches.length > 0 ? (
                             <ul className="space-y-1">
                                 {matches.map((m, i) => (
                                     <li key={i} className="text-xs font-mono text-slate-600 p-1 hover:bg-white rounded border border-transparent hover:border-slate-100 flex gap-2">
                                         <span className="text-slate-400 w-6">#{i+1}</span>
                                         <span className="font-bold text-brand-700 truncate max-w-[200px]">"{m[0]}"</span>
                                         <span className="text-slate-400">index: {m.index}</span>
                                         {m.length > 1 && (
                                             <span className="text-slate-500 ml-auto">Groups: {m.length - 1}</span>
                                         )}
                                     </li>
                                 ))}
                             </ul>
                         ) : (
                             <p className="text-xs text-slate-400 text-center py-4 italic">No matches found</p>
                         )}
                     </div>
                 </div>
                 
                 <div className="flex items-end gap-2">
                     <button 
                        onClick={handleCopyMatches}
                        disabled={matches.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition disabled:opacity-50"
                     >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Matches'}
                     </button>
                     <button 
                        onClick={() => { setPattern(''); setInputText(''); setError(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg font-medium transition"
                     >
                        <Trash2 className="w-4 h-4" /> Clear
                     </button>
                 </div>
             </div>
        </div>
    </div>
  );
}

export const RandomWordGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [wordType, setWordType] = useState<'all' | 'nouns' | 'verbs' | 'adjectives'>('all');
  const [format, setFormat] = useState<'list' | 'comma' | 'space'>('list');
  const [startsWith, setStartsWith] = useState('');
  const [minLength, setMinLength] = useState<string>('');
  const [maxLength, setMaxLength] = useState<string>('');
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Simplified dictionary for demo purposes - in a real app this might be larger or external
  const DICTIONARY = {
    nouns: ["time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child", "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government", "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name", "president", "team", "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "food", "moment", "air", "teacher", "force", "order", "development", "money", "sense", "foot", "moment", "policy", "music", "market", "star", "voice"],
    verbs: ["be", "have", "do", "say", "go", "get", "make", "know", "think", "take", "see", "come", "want", "look", "use", "find", "give", "tell", "work", "call", "try", "ask", "need", "feel", "become", "leave", "put", "mean", "keep", "let", "begin", "seem", "help", "talk", "turn", "start", "might", "show", "hear", "play", "run", "move", "like", "live", "believe", "hold", "bring", "happen", "must", "write", "provide", "sit", "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win", "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass", "sell", "require", "report", "decide", "pull"],
    adjectives: ["good", "new", "first", "last", "long", "great", "little", "own", "other", "old", "right", "big", "high", "different", "small", "large", "next", "early", "young", "important", "few", "public", "bad", "same", "able", "to", "under", "above", "famous", "late", "hard", "major", "better", "strong", "possible", "whole", "free", "military", "true", "federal", "international", "full", "special", "easy", "clear", "recent", "certain", "personal", "open", "red", "difficult", "available", "likely", "short", "single", "medical", "current", "wrong", "private", "past", "foreign", "fine", "common", "poor", "natural", "significant", "similar", "hot", "dead", "central", "happy", "serious", "ready", "simple", "left", "physical", "general", "environmental", "financial", "blue", "democratic", "dark", "various", "entire", "close", "legal", "religious", "cold", "final", "main", "green", "nice", "huge", "popular", "traditional", "cultural"]
  };

  const handleGenerate = () => {
    let pool: string[] = [];
    if (wordType === 'all') {
        pool = [...DICTIONARY.nouns, ...DICTIONARY.verbs, ...DICTIONARY.adjectives];
    } else {
        pool = DICTIONARY[wordType];
    }

    // Filters
    if (startsWith.trim()) {
        pool = pool.filter(w => w.toLowerCase().startsWith(startsWith.toLowerCase().trim()));
    }
    
    const min = parseInt(minLength);
    const max = parseInt(maxLength);
    
    if (!isNaN(min)) pool = pool.filter(w => w.length >= min);
    if (!isNaN(max)) pool = pool.filter(w => w.length <= max);

    // Randomize
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    setGeneratedWords(shuffled.slice(0, Math.min(Math.max(1, count), pool.length)));
  };

  const getOutputText = () => {
      if (format === 'comma') return generatedWords.join(', ');
      if (format === 'space') return generatedWords.join(' ');
      return generatedWords.join('\n');
  };

  const handleCopy = () => {
      const text = getOutputText();
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      const text = getOutputText();
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'random-words.txt';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleReset = () => {
      setCount(5);
      setWordType('all');
      setFormat('list');
      setStartsWith('');
      setMinLength('');
      setMaxLength('');
      setGeneratedWords([]);
  };

  useEffect(() => {
      handleGenerate();
  }, []);

  return (
      <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                      <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Word Count</label>
                          <input 
                              type="number" 
                              value={count} 
                              onChange={e => setCount(parseInt(e.target.value) || 1)}
                              min="1" max="100"
                              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Word Type</label>
                          <select 
                              value={wordType}
                              onChange={e => setWordType(e.target.value as any)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          >
                              <option value="all">All Types</option>
                              <option value="nouns">Nouns</option>
                              <option value="verbs">Verbs</option>
                              <option value="adjectives">Adjectives</option>
                          </select>
                      </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Starts With (Optional)</label>
                          <input 
                              type="text" 
                              value={startsWith} 
                              onChange={e => setStartsWith(e.target.value)}
                              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                              placeholder="e.g. a"
                              maxLength={1}
                          />
                      </div>
                      <div className="flex gap-2">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Len</label>
                              <input 
                                  type="number" 
                                  value={minLength} 
                                  onChange={e => setMinLength(e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                  placeholder="Any"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Len</label>
                              <input 
                                  type="number" 
                                  value={maxLength} 
                                  onChange={e => setMaxLength(e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                  placeholder="Any"
                              />
                          </div>
                      </div>
                  </div>

                  {/* Format & Action */}
                  <div className="space-y-4 flex flex-col justify-between">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Output Format</label>
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                              <button onClick={() => setFormat('list')} className={`flex-1 py-1.5 text-xs font-medium rounded ${format === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>List</button>
                              <button onClick={() => setFormat('comma')} className={`flex-1 py-1.5 text-xs font-medium rounded ${format === 'comma' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>Comma</button>
                              <button onClick={() => setFormat('space')} className={`flex-1 py-1.5 text-xs font-medium rounded ${format === 'space' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>Space</button>
                          </div>
                      </div>
                      <button 
                          onClick={handleGenerate}
                          className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2"
                      >
                          <RefreshCw className="w-4 h-4" /> Generate Words
                      </button>
                  </div>
              </div>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-700">Generated Result ({generatedWords.length})</h3>
                   <div className="flex gap-2">
                       <button 
                          onClick={handleCopy}
                          disabled={generatedWords.length === 0}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition disabled:opacity-50"
                       >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied' : 'Copy'}
                       </button>
                       <button 
                          onClick={handleDownload}
                          disabled={generatedWords.length === 0}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition disabled:opacity-50"
                       >
                          <Download className="w-4 h-4" /> Download
                       </button>
                       <button 
                          onClick={handleReset}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-600 text-sm font-medium transition"
                       >
                          <Trash2 className="w-4 h-4" /> Reset
                       </button>
                   </div>
               </div>

               <textarea 
                  readOnly
                  value={getOutputText()}
                  className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed resize-y focus:outline-none font-mono text-sm"
                  placeholder="Generated words will appear here..."
               />
          </div>
      </div>
  );
};

export const StylishTextGenerator: React.FC = () => {
  const [text, setText] = useState('ToolMaster Pro');
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  // Mapping constants
  const NORMAL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  // Standard Transformations
  const mapChars = (str: string, to: string) => {
      return str.split('').map(c => {
          const i = NORMAL.indexOf(c);
          return i > -1 ? to[i*2] + to[i*2+1] : c; // Handling surrogate pairs for some sets if needed, but for direct maps:
      }).join('');
  }

  const simpleMap = (str: string, to: string) => {
      // This handles single char to single/surrogate char mapping if strings are aligned
      // Unicode math characters are often surrogate pairs in JS string representation
      // We will use a more robust array-based approach for safety
      const chars = Array.from(to);
      // If chars length matches NORMAL length (62), straightforward
      // If chars length is double (surrogates), we need to chunk
      
      const isSurrogate = chars.length > 62;
      
      return str.split('').map(c => {
          const idx = NORMAL.indexOf(c);
          if (idx === -1) return c;
          
          if (isSurrogate) {
               // Assuming strictly surrogate pairs (2 chars per char)
               // Many unicode math bold chars are 2 code units
               // HOWEVER, converting string to Array.from splits by code point, which is safe for surrogates!
               return chars[idx] || c;
          }
          return chars[idx] || c;
      }).join('');
  }

  // Styles
  const STYLES = [
      { id: 'bold_serif', name: 'Bold (Serif)', map: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
      { id: 'bold_sans', name: 'Bold (Sans)', map: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵" },
      { id: 'italic_serif', name: 'Italic (Serif)', map: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍0123456789" },
      { id: 'italic_sans', name: 'Italic (Sans)', map: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789" },
      { id: 'bold_italic_serif', name: 'Bold Italic', map: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
      { id: 'bold_italic_sans', name: 'Bold Italic (Sans)', map: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝐁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
      { id: 'script', name: 'Script', map: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789" },
      { id: 'bold_script', name: 'Bold Script', map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
      { id: 'fraktur', name: 'Fraktur / Gothic', map: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ0123456789" },
      { id: 'bold_fraktur', name: 'Bold Fraktur', map: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
      { id: 'double', name: 'Double Struck', map: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" },
      { id: 'sans', name: 'Sans Serif', map: "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫" },
      { id: 'mono', name: 'Monospace', map: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙊𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺 п𝟼𝟽𝟾𝟿" }, // 5 is glitchy in some sets, manually fixed 5 here? No, 5 is 𝟻
      { id: 'circled', name: 'Circled', map: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨" },
      { id: 'circled_dark', name: 'Circled Dark', map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿➊➋➌➍➎➏➐➑➒" }, // Lowercase dark circles don't exist in standard block easily, mapped to upper
      { id: 'squared', name: 'Squared', map: "squared" }, // Handled specially
      { id: 'wide', name: 'Wide Text', map: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２𝟑４５６７８９" },
      { id: 'small_caps', name: 'Small Caps', map: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ0123456789" }, // q and x don't have perfect matches
  ];

  const transform = (txt: string, styleId: string, map?: string) => {
      if (styleId === 'squared') {
          // Squared logic manually because map string is huge
          return simpleMap(txt, "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789");
      }
      if (styleId === 'upside_down') {
           // Simple flip map
           const FLIP_MAP: any = { 'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': '⋊', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ò', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'h', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", '?': '¿', '!': '¡', '"': ',,', "'": ',', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾' };
           return txt.split('').reverse().map(c => FLIP_MAP[c] || c).join('');
      }
      if (styleId === 'mirror') {
          // Just reverse? Or actual mirror chars? True mirror is hard, usually reverse is sufficient for "mirror text" tools unless using specific mirror unicode
          return txt.split('').reverse().join('');
      }
      if (styleId === 'brackets') return txt.split('').map(c => c === ' ' ? ' ' : `(${c})`).join('');
      if (styleId === 'squares_bracket') return txt.split('').map(c => c === ' ' ? ' ' : `[${c}]`).join('');
      if (styleId === 'slash') return txt.split('').join(' ⁄ ');
      if (styleId === 'underline') return txt.split('').join('\u0332') + '\u0332';
      if (styleId === 'strike') return txt.split('').join('\u0336') + '\u0336';
      if (styleId === 'hearts') return `♥ ${txt} ♥`;
      if (styleId === 'stars') return `★ ${txt} ★`;
      if (styleId === 'aesthetic') return txt.split('').join(' ');

      return map ? simpleMap(txt, map) : txt;
  };

  const handleCopy = (str: string, id: string) => {
      navigator.clipboard.writeText(str);
      setCopiedStyle(id);
      setTimeout(() => setCopiedStyle(null), 2000);
  };

  const handleCopyAll = () => {
      const allText = STYLES.map(s => transform(text, s.id, s.map)).join('\n');
      navigator.clipboard.writeText(allText);
      setCopiedStyle('all');
      setTimeout(() => setCopiedStyle(null), 2000);
  };

  return (
      <div className="max-w-5xl mx-auto space-y-8">
          {/* Input Area */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-30">
              <div className="relative">
                   <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full p-4 pr-12 border-2 border-brand-100 focus:border-brand-500 rounded-xl text-lg focus:outline-none h-32 resize-none transition-colors"
                      placeholder="Type your text here..."
                   />
                   {text && (
                       <button 
                          onClick={() => setText('')}
                          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 hover:bg-slate-100 transition"
                       >
                           <X className="w-5 h-5" />
                       </button>
                   )}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                   <div className="text-sm text-slate-500 font-medium">
                       {text.length} characters
                   </div>
                   <button 
                       onClick={handleCopyAll}
                       disabled={!text}
                       className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition disabled:opacity-50"
                   >
                       {copiedStyle === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       Copy All Styles
                   </button>
              </div>
          </div>

          {/* Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {STYLES.map((style) => {
                   const res = transform(text, style.id, style.map);
                   const isCopied = copiedStyle === style.id;
                   
                   return (
                       <div key={style.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{style.name}</span>
                                <button 
                                    onClick={() => handleCopy(res, style.id)}
                                    className={`p-1.5 rounded-md transition ${isCopied ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50'}`}
                                    title="Copy"
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="font-medium text-lg text-slate-800 break-all min-h-[1.75rem]">
                                {res || <span className="text-slate-300 italic">Preview...</span>}
                            </div>
                       </div>
                   );
               })}
               
               {/* Extra styles not in main list */}
               {[
                   {id: 'upside_down', name: 'Upside Down'},
                   {id: 'mirror', name: 'Mirror Text'},
                   {id: 'aesthetic', name: 'Aesthetic Spaced'},
                   {id: 'brackets', name: 'Brackets'},
                   {id: 'squares_bracket', name: 'Square Brackets'},
                   {id: 'underline', name: 'Underline'},
                   {id: 'strike', name: 'Strikethrough'},
                   {id: 'slash', name: 'Slashed'},
                   {id: 'hearts', name: 'Hearts Decoration'},
                   {id: 'stars', name: 'Stars Decoration'},
               ].map(style => {
                   const res = transform(text, style.id);
                   const isCopied = copiedStyle === style.id;
                   return (
                       <div key={style.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{style.name}</span>
                                <button 
                                    onClick={() => handleCopy(res, style.id)}
                                    className={`p-1.5 rounded-md transition ${isCopied ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50'}`}
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="font-medium text-lg text-slate-800 break-all min-h-[1.75rem]">
                                {res || <span className="text-slate-300 italic">Preview...</span>}
                            </div>
                       </div>
                   );
               })}
          </div>
      </div>
  );
};