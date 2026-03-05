import { useState } from "react";
import { Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockCurrencies } from "@/data/enterprise-mock";
import { CurrencyRate } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

export const CurrencySettings = () => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>(mockCurrencies);

  const toggleStatus = (id: string, currentStatus: boolean, code: string) => {
    setCurrencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus, updatedAt: new Date().toISOString() } : c))
    );
    toast.success(`${code} is now ${!currentStatus ? "active" : "inactive"}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Currencies</CardTitle>
              <CardDescription>Manage available currencies for expense processing.</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-xs px-2 py-1 bg-primary/5">
              Base Currency: NGN
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">{c.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "default" : "secondary"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(c.updatedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={() => toggleStatus(c.id, c.isActive, c.code)}
                      disabled={c.code === "NGN"} // Prevent disabling base currency
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencySettings;
