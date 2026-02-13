"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UploadStatus = "idle" | "uploading" | "ocr_processing" | "analyzing" | "completed" | "error"

interface Step {
    id: UploadStatus
    label: string
}

const STEPS: Step[] = [
    { id: "uploading", label: "Uploading Document" },
    { id: "ocr_processing", label: "Extracting Text (OCR)" },
    { id: "analyzing", label: "AI Eligibility Analysis" },
    { id: "completed", label: "Analysis Complete" }
]

export function UploadWizard() {
    const [status, setStatus] = useState<UploadStatus>("idle")
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selected = acceptedFiles[0]
        if (selected?.type !== "application/pdf") {
            setError("Invalid file type. Please upload a PDF.")
            return
        }
        setFile(selected)
        setError(null)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: status !== "idle"
    })

    const startUpload = async () => {
        if (!file) return

        setStatus("uploading")
        setProgress(10)

        // Mock Pipeline Simulation
        setTimeout(() => {
            setStatus("ocr_processing")
            setProgress(40)
        }, 1500)

        setTimeout(() => {
            setStatus("analyzing")
            setProgress(70)
        }, 3500)

        setTimeout(() => {
            setStatus("completed")
            setProgress(100)
        }, 5500)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {status === "idle" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key="dropzone"
                    >
                        <div
                            {...getRootProps()}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
                                isDragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                                file ? "border-blue-500/50" : ""
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-white/5">
                                    <UploadCloud className="w-8 h-8 text-blue-400" />
                                </div>
                                {file ? (
                                    <div>
                                        <p className="font-medium text-white text-lg">{file.name}</p>
                                        <p className="text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-lg font-medium text-white">
                                            {isDragActive ? "Drop PDF here" : "Drag & Drop Tender PDF"}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-2">
                                            or click to browse locally (Max 50MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={startUpload}
                                disabled={!file}
                                className="btn-primary w-full sm:w-auto"
                            >
                                Start Analysis
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key="progress"
                        className="glass-card p-8 space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-bold text-white">Analyzing Tender...</h3>
                            <p className="text-slate-400">Please wait while our AI processes the document.</p>
                        </div>

                        <div className="space-y-6">
                            {STEPS.map((step, index) => {
                                const isActive = status === step.id
                                const isCompleted = STEPS.findIndex(s => s.id === status) > index

                                return (
                                    <div key={step.id} className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                                            isActive ? "border-blue-500 bg-blue-500/20 text-blue-400" :
                                                isCompleted ? "border-green-500 bg-green-500/20 text-green-400" :
                                                    "border-white/10 bg-white/5 text-slate-500"
                                        )}>
                                            {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                                isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                                    <div className="w-2 h-2 rounded-full bg-current" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isActive || isCompleted ? "text-white" : "text-slate-500"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        <Progress value={progress} className="h-2" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
