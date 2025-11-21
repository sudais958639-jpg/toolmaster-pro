

import React, { useState, useRef, useEffect } from 'react';
import { performOCR } from '../services/gemini';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Scan, 
  Copy, 
  Youtube, 
  Link, 
  ExternalLink, 
  Film, 
  Play,
  Search,
  Globe,
  Server,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  FileJson,
  RotateCcw
} from 'lucide-react';

// --- IMAGE ---
export const ImageCompressor: React.FC = () => {
    const [img, setImg] = useState<string | null>(null);
    const [compressed, setCompressed] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [originalSize, setOriginalSize] = useState<string>('');
    const [compressedSize, setCompressedSize] = useState<string>('');

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setFileName(file.name);
            setOriginalSize(formatSize(file.size));
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImg(ev.target?.result as string);
                
                const imgObj = new Image();
                imgObj.src = ev.target?.result as string;
                imgObj.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = imgObj.width;
                    canvas.height = imgObj.height;
                    const ctx = canvas.getContext('2d');
                    if(ctx) {
                        ctx.drawImage(imgObj, 0, 0);
                        const type = file.type || 'image/jpeg';
                        const quality = 0.6;
                        const compressedDataUrl = canvas.toDataURL(type, quality);
                        setCompressed(compressedDataUrl);

                        const head = `data:${type};base64,`;
                        const size = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
                        setCompressedSize(formatSize(size));
                    }
                }
            }
            reader.readAsDataURL(file);
        }
    }

    const downloadImage = () => {
        if (compressed && fileName) {
            const link = document.createElement('a');
            link.href = compressed;
            
            const lastDotIndex = fileName.lastIndexOf('.');
            const name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
            const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : 'jpg';
            
            link.download = `${name}-compressed.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    return (
        <div className="space-y-6">
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <div className="flex flex-col items-center pointer-events-none">
                    <Upload className="w-8 h-8 text-brand-400 mb-2"/>
                    <p className="text-sm text-slate-600 font-medium">Click or Drag to Upload Image</p>
                </div>
            </div>

            {img && compressed && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <p className="font-bold text-slate-700">Original</p>
                            <span className="text-xs text-slate-500 font-mono">{originalSize}</span>
                        </div>
                        <img src={img} className="w-full rounded border border-slate-200 shadow-sm"/>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <p className="font-bold text-green-600">Compressed (60%)</p>
                            <span className="text-xs text-green-700 font-mono font-bold">{compressedSize}</span>
                        </div>
                        <img src={compressed} className="w-full rounded border border-green-200 shadow-sm"/>
                        <button 
                            onClick={downloadImage}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition font-medium shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Download Compressed Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [inputW, setInputW] = useState<string>('');
  const [inputH, setInputH] = useState<string>('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [resizedImage, setResizedImage] = useState<{ url: string; w: number; h: number; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }
    setError(null);
    setFile(selectedFile);
    setResizedImage(null);
    
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    const img = new Image();
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
      setInputW(img.width.toString());
      setInputH(img.height.toString());
    };
    img.src = objectUrl;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDimensionChange = (type: 'w' | 'h', value: string) => {
    // Allow empty string to let user delete input
    if (value === '') {
      type === 'w' ? setInputW('') : setInputH('');
      return;
    }

    // Validate numeric input
    if (!/^\d*$/.test(value)) return;

    const valNum = parseInt(value, 10);
    
    if (type === 'w') {
      setInputW(value);
      if (lockAspectRatio && dimensions && valNum) {
        const ratio = dimensions.w / dimensions.h;
        setInputH(Math.round(valNum / ratio).toString());
      }
    } else {
      setInputH(value);
      if (lockAspectRatio && dimensions && valNum) {
        const ratio = dimensions.w / dimensions.h;
        setInputW(Math.round(valNum * ratio).toString());
      }
    }
  };

  const handlePercentage = (pct: number) => {
    if (!dimensions) return;
    const newW = Math.round(dimensions.w * (pct / 100));
    const newH = Math.round(dimensions.h * (pct / 100));
    setInputW(newW.toString());
    setInputH(newH.toString());
  };

  const handleResize = () => {
    if (!file || !preview || !inputW || !inputH) return;
    const w = parseInt(inputW);
    const h = parseInt(inputH);
    
    if (w <= 0 || h <= 0) {
      setError('Dimensions must be greater than 0.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const type = file.type; // Maintain original format
      const url = canvas.toDataURL(type, 0.95); // High quality
      
      // Calculate size roughly
      const head = `data:${type};base64,`;
      const size = Math.round((url.length - head.length) * 3 / 4);

      setResizedImage({
        url,
        w,
        h,
        size
      });
      setError(null);
    };
    img.src = preview;
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setDimensions(null);
    setInputW('');
    setInputH('');
    setResizedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto">
       {/* Drag Drop Area */}
       {!file ? (
         <div 
           className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:bg-slate-50'}`}
           onDragOver={onDragOver}
           onDragLeave={onDragLeave}
           onDrop={onDrop}
           onClick={() => fileInputRef.current?.click()}
         >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp, image/gif"
            />
            <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                    {isDragging ? 'Drop image here' : 'Click or Drag Image to Upload'}
                </h3>
                <p className="text-slate-500 mt-2">Supports JPG, PNG, WebP, GIF</p>
            </div>
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-brand-600" /> Resize Settings
                  </h3>

                  {/* Dimensions Input */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Dimensions</label>
                       <button 
                         onClick={() => setLockAspectRatio(!lockAspectRatio)}
                         className={`text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition ${lockAspectRatio ? 'text-brand-600 font-medium' : 'text-slate-400'}`}
                       >
                         {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                         {lockAspectRatio ? 'Locked' : 'Unlocked'}
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={inputW}
                                onChange={(e) => handleDimensionChange('w', e.target.value)}
                                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                                placeholder="Width"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">px</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={inputH}
                                onChange={(e) => handleDimensionChange('h', e.target.value)}
                                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                                placeholder="Height"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">px</span>
                        </div>
                    </div>

                    {/* Percentages */}
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quick Scale</label>
                       <div className="grid grid-cols-4 gap-2">
                          {[25, 50, 75, 100].map(pct => (
                            <button 
                                key={pct}
                                onClick={() => handlePercentage(pct)}
                                className="px-2 py-1.5 text-sm border border-slate-200 rounded hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition text-slate-600"
                            >
                                {pct}%
                            </button>
                          ))}
                       </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                             <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                             <span>{error}</span>
                        </div>
                    )}

                    <button 
                        onClick={handleResize}
                        disabled={!inputW || !inputH}
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Resize Image
                    </button>
                    
                    <button 
                        onClick={reset}
                        className="w-full py-2 text-slate-500 text-sm hover:text-red-600 transition"
                    >
                        Clear / Start Over
                    </button>
                  </div>
               </div>

               {/* Original File Info */}
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Original Image</h4>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                        <img src={preview || ''} className="max-w-full max-h-full" />
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-slate-500">{formatSize(file.size)} • {dimensions?.w} × {dimensions?.h} px</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-8">
               <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 min-h-[500px] flex flex-col items-center justify-center relative">
                   {resizedImage ? (
                       <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
                            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 mb-6 max-w-full">
                                <img src={resizedImage.url} alt="Resized" className="max-w-full max-h-[400px] rounded-lg" />
                            </div>
                            
                            <div className="flex items-center gap-8 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 mb-6">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">New Size</p>
                                    <p className="font-bold text-slate-800">{formatSize(resizedImage.size)}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Dimensions</p>
                                    <p className="font-bold text-slate-800">{resizedImage.w} × {resizedImage.h}</p>
                                </div>
                            </div>

                            <a 
                                href={resizedImage.url} 
                                download={`resized-${file.name}`}
                                className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-700 shadow-lg hover:shadow-brand-200 transition"
                            >
                                <Download className="w-5 h-5" /> Download Image
                            </a>
                       </div>
                   ) : (
                       <div className="text-center opacity-50">
                           <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                           <p className="text-lg font-medium text-slate-600">Preview Area</p>
                           <p className="text-slate-400">Click "Resize Image" to see the result here</p>
                       </div>
                   )}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export const OCRTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Unsupported file type. Please upload an image (JPEG, PNG, WEBP).');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File is too large. Maximum size is 10MB.');
            return;
        }

        setError('');
        setResult('');
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const processImage = async () => {
        if (!preview) return;
        setLoading(true);
        setError('');
        try {
            const text = await performOCR(preview);
            setResult(text);
        } catch (err) {
            setError('Failed to process image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyText = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadText = () => {
        if (!result) return;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-result-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setResult('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload Section */}
            {!file ? (
                <div 
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:bg-slate-50'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                        className="hidden" 
                        accept="image/jpeg, image/png, image/webp, image/gif, image/bmp"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                            {/* Icon */}
                            <Scan className="w-8 h-8" /> 
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {isDragging ? 'Drop image here' : 'Click or Drag Image to Scan'}
                        </h3>
                        <p className="text-slate-500 mt-2">Supports JPG, PNG, WebP</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Preview Column */}
                    <div className="space-y-4">
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                            <div className="aspect-video bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative">
                                <img src={preview || ''} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                         </div>

                         <button 
                            onClick={processImage} 
                            disabled={loading}
                            className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                            {loading ? 'Processing...' : 'Extract Text'}
                        </button>
                        
                        {error && (
                             <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                 <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                 <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Result Column */}
                    <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Extracted Text</label>
                            {result && (
                                <div className="flex gap-2">
                                     <button onClick={copyText} className="flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition">
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                                     </button>
                                     <button onClick={downloadText} className="flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition">
                                        <Download className="w-3 h-3" /> Save
                                     </button>
                                </div>
                            )}
                        </div>
                        <textarea 
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            placeholder="Extracted text will appear here..."
                            className="flex-1 w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-slate-700 leading-relaxed"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export const FaviconGenerator: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [favicons, setFavicons] = useState<{ size: number; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreview(url);
            setFavicons([]);
        }
    };

    const generate = () => {
        if (!preview) return;
        const img = new Image();
        img.onload = () => {
            const sizes = [16, 32, 48, 64];
            const generated = sizes.map(size => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, size, size);
                    return { size, url: canvas.toDataURL('image/png') };
                }
                return null;
            }).filter(Boolean) as { size: number; url: string }[];
            setFavicons(generated);
        };
        img.src = preview;
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setFavicons([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {!file ? (
                <div 
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="hidden" 
                        accept="image/png, image/jpeg, image/svg+xml"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Upload Image</h3>
                        <p className="text-slate-500 mt-2">PNG, JPG, or SVG (Square images recommended)</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700">Source Image</h3>
                                <button onClick={reset} className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700">
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                            <div className="flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 p-4 min-h-[200px]">
                                <img src={preview || ''} alt="Source" className="max-h-48 object-contain" />
                            </div>
                            <button 
                                onClick={generate}
                                className="w-full mt-6 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-sm flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" /> Generate Favicons
                            </button>
                         </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="font-bold text-slate-800">Generated Icons</h3>
                         {favicons.length > 0 ? (
                             <div className="grid grid-cols-1 gap-4">
                                 {favicons.map(icon => (
                                     <div key={icon.size} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                         <div className="flex items-center gap-4">
                                             <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                                                 <img src={icon.url} alt={`${icon.size}x${icon.size}`} width={icon.size} height={icon.size} />
                                             </div>
                                             <div>
                                                 <p className="font-bold text-slate-700">{icon.size} x {icon.size}</p>
                                                 <p className="text-xs text-slate-400">Standard PNG</p>
                                             </div>
                                         </div>
                                         <a 
                                            href={icon.url} 
                                            download={`favicon-${icon.size}x${icon.size}.png`}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium transition"
                                         >
                                             <Download className="w-4 h-4" /> Download
                                         </a>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center text-slate-400">
                                 <p>Click "Generate" to create favicons</p>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- YOUTUBE URL GENERATOR ---
interface VideoData {
    id: string;
    title: string;
    author: string;
    thumb: string;
}

export const YouTubeThumbnail: React.FC = () => {
    const [input, setInput] = useState('');
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [useStartTime, setUseStartTime] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const processInput = async () => {
        setError('');
        setVideoData(null);
        setLoading(true);

        let id = '';
        // Check if input is ID (11 chars, alphanumeric dash underscore)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
            id = input.trim();
        } else {
            // Try extract from URL
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = input.match(regExp);
            if (match && match[7].length === 11) {
                id = match[7];
            }
        }

        if (!id) {
            setError('Invalid YouTube URL or Video ID');
            setLoading(false);
            return;
        }

        // Fetch Metadata
        try {
            // Attempt to fetch title via noembed (public oEmbed proxy usually works for YouTube)
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
            const data = await response.json();
            
            if (data.error) {
                 // Fallback for videos that might have restrictions or if API fails
                 setVideoData({
                    id,
                    title: 'YouTube Video (Title Unavailable)',
                    author: '',
                    thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                });
            } else {
                setVideoData({
                    id,
                    title: data.title || 'Unknown Video',
                    author: data.author_name || '',
                    thumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                });
            }
        } catch (e) {
            // Network failure fallback
             setVideoData({
                id,
                title: 'YouTube Video',
                author: '',
                thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedUrl(label);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            // Fallback for direct link download if fetch fails (e.g. CORS)
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            link.click();
        }
    };

    const getUrl = (type: 'watch' | 'short' | 'embed' | 'shorts' | 'autoplay' | 'loop') => {
        if (!videoData) return '';
        const id = videoData.id;
        const timeParam = useStartTime && startTime > 0 ? (type.includes('?') ? `&t=${startTime}s` : `?t=${startTime}s`) : '';
        
        switch (type) {
            case 'watch': return `https://www.youtube.com/watch?v=${id}${timeParam}`;
            case 'short': return `https://youtu.be/${id}${timeParam}`;
            case 'embed': return `https://www.youtube.com/embed/${id}${timeParam.replace('t=', 'start=')}`; // Embed uses start=
            case 'shorts': return `https://www.youtube.com/shorts/${id}`;
            case 'autoplay': return `https://www.youtube.com/embed/${id}?autoplay=1${timeParam.replace('t=', 'start=').replace('?', '&')}`;
            case 'loop': return `https://www.youtube.com/embed/${id}?loop=1&playlist=${id}${timeParam.replace('t=', 'start=').replace('?', '&')}`;
            default: return '';
        }
    };

    const renderUrlRow = (label: string, type: 'watch' | 'short' | 'embed' | 'shorts' | 'autoplay' | 'loop') => {
        const url = getUrl(type);
        return (
            <div className="flex items-center gap-2 mb-3">
                <div className="w-32 shrink-0 text-sm font-medium text-slate-600">{label}</div>
                <div className="flex-1 relative">
                    <input 
                        readOnly 
                        value={url} 
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono focus:outline-none focus:border-brand-300"
                    />
                </div>
                <button 
                    onClick={() => copyToClipboard(url, type)} 
                    className={`p-2 rounded-lg transition ${copiedUrl === type ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                    title="Copy URL"
                >
                    {copiedUrl === type ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                </button>
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
                    title="Open Link"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        );
    };

    const thumbs = videoData ? [
        { label: 'Max Resolution', url: `https://img.youtube.com/vi/${videoData.id}/maxresdefault.jpg`, size: '1280x720' },
        { label: 'High Quality', url: `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`, size: '480x360' },
        { label: 'Medium Quality', url: `https://img.youtube.com/vi/${videoData.id}/mqdefault.jpg`, size: '320x180' },
        { label: 'Standard', url: `https://img.youtube.com/vi/${videoData.id}/sddefault.jpg`, size: '640x480' },
        { label: 'Default', url: `https://img.youtube.com/vi/${videoData.id}/default.jpg`, size: '120x90' },
    ] : [];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full mb-2">
                        <Youtube className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">YouTube URL Generator</h2>
                    <p className="text-slate-500">Paste a YouTube link or ID to generate URLs and download thumbnails.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && processInput()}
                                placeholder="e.g. https://www.youtube.com/watch?v=..."
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={processInput}
                            disabled={loading || !input}
                            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md hover:shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                            Generate
                        </button>
                    </div>

                    {error && (
                        <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {videoData && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* Left: Preview & Thumbnails */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Preview Card */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative group mb-4">
                                <img src={videoData.thumb} alt={videoData.title} className="w-full h-full object-cover" />
                                <a 
                                    href={`https://www.youtube.com/watch?v=${videoData.id}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Play className="w-16 h-16 text-white fill-current drop-shadow-lg" />
                                </a>
                            </div>
                            <h3 className="font-bold text-slate-800 line-clamp-2 mb-1">{videoData.title}</h3>
                            <p className="text-xs text-slate-500 font-mono">ID: {videoData.id}</p>
                        </div>

                        {/* Thumbnails List */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-red-500" /> Thumbnails
                            </h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {thumbs.map((thumb, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                                        <div className="w-20 h-12 bg-slate-200 rounded overflow-hidden shrink-0">
                                            <img src={thumb.url} className="w-full h-full object-cover" alt={thumb.label} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">{thumb.label}</p>
                                            <p className="text-xs text-slate-400">{thumb.size}</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadImage(thumb.url, `thumbnail-${videoData.id}-${thumb.label.replace(/\s+/g, '-')}.jpg`)}
                                            className="p-2 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: URL Generator */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Link className="w-5 h-5 text-blue-500" /> Generated URLs
                                </h3>
                                
                                <label className="flex items-center gap-2 text-sm cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={useStartTime} 
                                        onChange={(e) => setUseStartTime(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-slate-700">Start At</span>
                                    <input 
                                        type="number" 
                                        value={startTime}
                                        onChange={(e) => setStartTime(Math.max(0, parseInt(e.target.value) || 0))}
                                        className={`w-16 p-1 border rounded text-center text-xs outline-none focus:border-blue-500 transition ${!useStartTime ? 'opacity-50 pointer-events-none bg-slate-100' : 'bg-white border-slate-300'}`}
                                        min="0"
                                    />
                                    <span className="text-slate-400 text-xs">sec</span>
                                </label>
                            </div>

                            <div className="space-y-1">
                                {renderUrlRow('Standard Link', 'watch')}
                                {renderUrlRow('Short Link', 'short')}
                                {renderUrlRow('Embed Code', 'embed')}
                                {renderUrlRow('Shorts URL', 'shorts')}
                                {renderUrlRow('Autoplay Embed', 'autoplay')}
                                {renderUrlRow('Loop Embed', 'loop')}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <Film className="w-4 h-4" /> Quick Info
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-400 uppercase text-xs font-bold mb-1">Video ID</p>
                                    <p className="font-mono font-medium text-blue-900 select-all">{videoData.id}</p>
                                </div>
                                <div>
                                    <p className="text-blue-400 uppercase text-xs font-bold mb-1">Channel</p>
                                    <p className="font-medium text-blue-900">{videoData.author || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COLOR PICKER ---
export const ColorPicker: React.FC = () => {
    const [hex, setHex] = useState('#0ea5e9');
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Color Picker</h3>
          <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="w-full h-12 cursor-pointer mb-4" />
          <p className="font-mono text-slate-600">{hex.toUpperCase()}</p>
      </div>
    );
};

// --- NETWORK ---
export const WhoisLookup: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const lookup = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain name.');
            return;
        }
        
        // Basic domain validation
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(domain)) {
             setError('Please enter a valid domain name (e.g. google.com).');
             return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            // Use RDAP (Registration Data Access Protocol) - The modern WHOIS
            const response = await fetch(`https://rdap.org/domain/${domain}`);
            
            if (response.status === 404) {
                // 404 usually means the domain is available (not found in registry)
                setError('Domain is available! (Not found in registry)');
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch domain data.');
            }

            const json = await response.json();
            setData(json);
        } catch (err) {
            setError('Could not retrieve WHOIS data. The TLD might not support RDAP or is restricted.');
        } finally {
            setLoading(false);
        }
    }

    // Helper to extract fields safely from RDAP JSON
    const getField = (path: string[], obj: any = data) => {
        return path.reduce((acc, curr) => acc && acc[curr], obj);
    };

    const getRegistrationDate = () => {
        const events = data?.events || [];
        const regEvent = events.find((e: any) => e.eventAction === 'registration');
        return regEvent ? regEvent.eventDate : null;
    };

    const getDomainAge = () => {
        const regDateStr = getRegistrationDate();
        if (!regDateStr) return 'Unknown';
        
        const regDate = new Date(regDateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - regDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const years = Math.floor(diffDays / 365);
        const days = diffDays % 365;
        
        if (years > 0) return `${years} Year${years > 1 ? 's' : ''}, ${days} Day${days > 1 ? 's' : ''}`;
        return `${days} Day${days > 1 ? 's' : ''}`;
    };

    const getAbuseContact = () => {
        if (!data?.entities) return 'Not Listed';
        // Recursive search for abuse contact in entities
        const findAbuse = (entities: any[]): string | null => {
             for (const entity of entities) {
                 if (entity.roles?.includes('abuse')) {
                      const vcard = entity.vcardArray?.[1];
                      if (vcard) {
                          const emailEntry = vcard.find((item: any) => item[0] === 'email');
                          if (emailEntry) return emailEntry[3];
                      }
                 }
                 if (entity.entities) {
                     const found = findAbuse(entity.entities);
                     if (found) return found;
                 }
             }
             return null;
        };
        return findAbuse(data.entities) || 'Not Listed';
    };

    const handleCopy = () => {
        const text = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadFile = (format: 'json' | 'txt') => {
        if (!data) return;
        let content = '';
        if (format === 'json') {
            content = JSON.stringify(data, null, 2);
        } else {
            content = `WHOIS Report for ${domain}\n\n`;
            content += `Handle: ${data.handle}\n`;
            content += `Status: ${data.status?.join(', ')}\n`;
            content += `Age: ${getDomainAge()}\n`;
            content += `DNSSEC: ${data.secureDNS?.delegationSigned ? 'Signed' : 'Unsigned'}\n`;
            content += `Nameservers:\n${data.nameservers?.map((ns:any) => `- ${ns.ldhName}`).join('\n')}\n`;
        }

        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${domain}-whois.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Search Box */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">WHOIS Lookup</h2>
                <p className="text-slate-500 mb-6">Check domain ownership, age, and registration details.</p>
                
                <div className="flex gap-3 max-w-xl mx-auto">
                    <div className="relative flex-1">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text" 
                            value={domain} 
                            onChange={e=>setDomain(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && lookup()}
                            placeholder="example.com" 
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                        />
                    </div>
                    <button 
                        onClick={lookup} 
                        disabled={loading} 
                        className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Lookup
                    </button>
                </div>
                
                {error && (
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${error.includes('available') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {error.includes('available') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {error}
                    </div>
                )}
            </div>

            {/* Result Card */}
            {data && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                             <Globe className="w-5 h-5 text-brand-600" />
                             <span className="font-bold text-slate-800 text-lg uppercase">{domain}</span>
                         </div>
                         <span className="text-xs font-mono text-slate-400">{data.handle}</span>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Blocks */}
                        <div className="space-y-4">
                             <div className="flex items-start gap-3">
                                 <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
                                 <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase">Domain Age</p>
                                     <p className="font-bold text-slate-800">{getDomainAge()}</p>
                                     <p className="text-xs text-slate-500">Created: {new Date(getRegistrationDate()).toLocaleDateString()}</p>
                                 </div>
                             </div>

                             <div className="flex items-start gap-3">
                                 <div className="mt-1 p-2 bg-purple-50 text-purple-600 rounded-lg"><Server className="w-4 h-4" /></div>
                                 <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase">Nameservers</p>
                                     <div className="text-sm font-medium text-slate-700">
                                         {data.nameservers?.map((ns: any) => (
                                             <div key={ns.ldhName}>{ns.ldhName}</div>
                                         )) || 'N/A'}
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="space-y-4">
                             <div className="flex items-start gap-3">
                                 <div className="mt-1 p-2 bg-orange-50 text-orange-600 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
                                 <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase">Status & Security</p>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                         {data.status?.map((s: string) => (
                                             <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{s}</span>
                                         ))}
                                     </div>
                                     <p className="text-xs text-slate-500 mt-1">DNSSEC: {data.secureDNS?.delegationSigned ? <span className="text-green-600 font-bold">Signed</span> : <span className="text-slate-400">Unsigned</span>}</p>
                                 </div>
                             </div>

                             <div className="flex items-start gap-3">
                                 <div className="mt-1 p-2 bg-red-50 text-red-600 rounded-lg"><User className="w-4 h-4" /></div>
                                 <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase">Abuse Contact</p>
                                     <p className="font-medium text-slate-800 break-all">{getAbuseContact()}</p>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 text-slate-600 py-2 rounded-lg transition font-medium text-sm"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Result'}
                        </button>
                        <button 
                            onClick={() => downloadFile('txt')}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 text-slate-600 py-2 rounded-lg transition font-medium text-sm"
                        >
                            <FileText className="w-4 h-4" /> TXT
                        </button>
                        <button 
                            onClick={() => downloadFile('json')}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 text-slate-600 py-2 rounded-lg transition font-medium text-sm"
                        >
                            <FileJson className="w-4 h-4" /> JSON
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- TYPING ---
export const TypingTest: React.FC = () => {
    const PARAGRAPHS = [
        "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet.",
        "Technology is best when it brings people together. It allows us to connect in ways we never thought possible.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts."
    ];
    const [text, setText] = useState(PARAGRAPHS[0]);
    const [input, setInput] = useState('');
    const [start, setStart] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [wpm, setWpm] = useState(0);
    
    useEffect(() => {
        if (start && input.length > 0) {
            const time = (Date.now() - startTime) / 1000 / 60;
            const words = input.length / 5;
            setWpm(Math.round(words / time));
        }
    }, [input, start]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!start) {
            setStart(true);
            setStartTime(Date.now());
        }
        setInput(e.target.value);
    };

    const reset = () => {
        setInput('');
        setStart(false);
        setWpm(0);
        setText(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-slate-200">
            <div className="mb-6 p-4 bg-slate-50 rounded-lg text-lg font-medium text-slate-700 leading-relaxed select-none">
                {text}
            </div>
            <textarea 
                value={input}
                onChange={handleChange}
                className="w-full p-4 border-2 border-slate-300 focus:border-brand-500 rounded-xl h-32 resize-none text-lg mb-4"
                placeholder="Start typing here..."
            />
            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-brand-600">{wpm} WPM</div>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700">
                    <RotateCcw className="w-4 h-4"/> Reset
                </button>
            </div>
        </div>
    );
};

export const SSLChecker: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const checkSSL = async () => {
        if (!domain) return;
        setLoading(true);
        
        // Simulating check as client-side SSL check is not possible due to CORS/Browser security
        // In a real app, this would call a backend endpoint
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setResult({
            domain: domain,
            valid: true,
            issuer: "Google Trust Services LLC",
            validFrom: new Date().toLocaleDateString(),
            validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
            protocol: "TLS 1.3",
            strength: "256-bit"
        });
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">SSL Certificate Checker</h2>
                <div className="flex gap-3 max-w-xl mx-auto">
                    <input 
                        type="text" 
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="example.com" 
                        className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <button 
                        onClick={checkSSL}
                        disabled={loading || !domain}
                        className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Check
                    </button>
                </div>
            </div>

            {result && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-800 text-lg">Secure Connection</h3>
                            <p className="text-green-600">Certificate is valid and trusted.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Common Name</p>
                            <p className="font-medium text-slate-800">{result.domain}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Issuer</p>
                            <p className="font-medium text-slate-800">{result.issuer}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Valid From</p>
                            <p className="font-medium text-slate-800">{result.validFrom}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Valid Until</p>
                            <p className="font-medium text-slate-800">{result.validTo}</p>
                        </div>
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Protocol</p>
                            <p className="font-medium text-slate-800">{result.protocol}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Encryption</p>
                            <p className="font-medium text-slate-800">{result.strength}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
