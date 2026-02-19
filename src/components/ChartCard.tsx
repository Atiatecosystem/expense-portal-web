import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Wrapper card for chart content with consistent styling */
const ChartCard = ({ title, description, children, className }: ChartCardProps) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default ChartCard;
