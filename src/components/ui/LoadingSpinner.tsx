export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in">
      <svg className="w-8 h-8 text-cream-400 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M16.023 14.652H21m-17.992 0v-4.993m0 4.993l-3.181-3.183A8.25 8.25 0 0113.803 3.7" />
      </svg>
      <p className="text-sm text-cream-400">命运之轮正在转动...</p>
    </div>
  )
}
