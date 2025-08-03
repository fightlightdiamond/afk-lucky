import { Progress } from "@/components/ui/progress";

interface HPBarProps {
    hp: number;        // HP hiện tại
    maxHp: number;     // HP tối đa
    color?: string;    // Optional: cho custom màu nếu muốn
    className?: string;
}

export default function HPBar({ hp, maxHp, color = "#22d3ee", className }: HPBarProps) {
    const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    return (
        <div className={`w-full flex items-center gap-2 ${className ?? ""}`}>
            <div className="text-xs font-bold w-8 text-right">{hp}</div>
            <Progress
                value={percent}
                className="flex-1 h-3 rounded-xl bg-gray-200 dark:bg-gray-700"
                style={{
                    // Nếu muốn đổi màu khi HP thấp thì custom ở đây:
                    "[&_[data-state=indeterminate]]": percent < 30 ? "#ef4444" : color,
                    "[&_[data-state=complete]]": percent < 30 ? "#ef4444" : color,
                } as React.CSSProperties}
            />
            <div className="text-xs text-gray-500 w-8">/ {maxHp}</div>
            <style>
                {`
        .${className ?? ""} .bg-primary, 
        .${className ?? ""} [data-state="indeterminate"] {
          background-color: var(--progress-color) !important;
        }
        `}
            </style>
        </div>
    );
}
