export default function LoadingDots() {
  return (
    <div className="flex space-x-2 items-center text-gray-400">
      <span>AI is thinking</span>
      <span className="flex space-x-1">
        <span className="animate-bounce delay-0">.</span>
        <span className="animate-bounce delay-150">.</span>
        <span className="animate-bounce delay-300">.</span>
      </span>
    </div>
  );
} 