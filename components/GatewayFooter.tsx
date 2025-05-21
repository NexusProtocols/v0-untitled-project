"use client"

interface GatewayFooterProps {
  currentStage: number
  totalStages: number
  allTasksCompleted: boolean
  onNextStage: () => void
}

export default function GatewayFooter({
  currentStage,
  totalStages,
  allTasksCompleted,
  onNextStage,
}: GatewayFooterProps) {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#333] py-4 fixed bottom-0 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {allTasksCompleted ? "All tasks completed for this stage!" : "Complete all tasks to continue"}
          </div>

          <button
            onClick={onNextStage}
            disabled={!allTasksCompleted}
            className={`interactive-element button-glow button-3d rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {currentStage === totalStages ? "Complete Gateway" : "Continue to Next Stage"}
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </footer>
  )
}
