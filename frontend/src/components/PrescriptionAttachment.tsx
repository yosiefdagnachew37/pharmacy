import React, { useState, useRef } from 'react';
import { Upload, Camera, X, FileText, CheckCircle } from 'lucide-react';

interface PrescriptionAttachmentProps {
    onAttachment: (url: string | null) => void;
    attachedUrl: string | null;
}

const PrescriptionAttachment: React.FC<PrescriptionAttachmentProps> = ({ onAttachment, attachedUrl }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            simulateUpload(file);
        }
    };

    const simulateUpload = (file: File) => {
        setIsUploading(true);
        // In a real app, this would be an actual upload to S3/Cloudinary/etc.
        setTimeout(() => {
            onAttachment(URL.createObjectURL(file)); // Using local URL for demo
            setIsUploading(false);
        }, 1500);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Prescription Image
                </label>
                {attachedUrl && (
                    <button
                        onClick={() => onAttachment(null)}
                        className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Remove
                    </button>
                )}
            </div>

            {!attachedUrl ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isUploading ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-800">Tap to Upload or Scan</p>
                            <p className="text-xs text-gray-400">Capture prescription photo from mobile or upload file</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative group">
                    <img
                        src={attachedUrl}
                        alt="Prescription"
                        className="w-full h-48 object-cover rounded-2xl border border-indigo-100 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-700 uppercase">Attached</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <Camera className="w-4 h-4 flex-shrink-0" />
                <span>Requirement: Clear photo of the original prescription showing patient name and doctor signature.</span>
            </div>
        </div>
    );
};

export default PrescriptionAttachment;
