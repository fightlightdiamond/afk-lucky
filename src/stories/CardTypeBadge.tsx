// components/CardTypeBadge.tsx
import { Badge } from "@/components/ui/badge";

export default function CardTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {type}
    </Badge>
  );
}
