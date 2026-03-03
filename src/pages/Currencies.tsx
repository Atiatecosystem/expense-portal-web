import { useState } from "react";
import { Coins, RefreshCw, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import PageHeader from "@/components/PageHeader";
import { mockCurrencies } from "@/data/enterprise-mock";
import { CurrencyRate } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

const Currencies = () => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>(mockCurrencies);
  const [editing, setEditing] = useState<CurrencyRate | null>(null);
  const [newRate, setNewRate] = useState("");

  const saveRate = () => {
    if (!editing || !newRate) return;
    setCurrencies((prev) => prev.map((c) => c.id === editing.id ? { ...c, rateToSAR: Number(newRate), updatedAt: new Date().toISOString() } : c));
    toast.success(`${editing.code} rate updated to ${newRate} SAR.`);
    setEditing(null);
    setNewRate("");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Currency Management" description="Manage exchange rates for multi-currency expense processing.">
        <Badge variant="outline" className="gap-1 text-xs">
          Base Currency: SAR
        </Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exchange Rates</CardTitle>
          <CardDescription>All rates are relative to SAR (Saudi Riyal). Hover for conversion details.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Rate (to SAR)</TableHead>
                <TableHead>1 SAR =</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm font-semibold text-foreground">{c.rateToSAR}</span>
                      </TooltipTrigger>
                      <TooltipContent>1 {c.code} = {c.rateToSAR} SAR</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.rateToSAR === 1 ? "—" : (1 / c.rateToSAR).toFixed(4)} {c.code}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(c.updatedAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {c.code !== "SAR" && (
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setEditing(c); setNewRate(String(c.rateToSAR)); }}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Rate Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {editing?.code} Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Rate to SAR</Label>
              <Input type="number" step="0.0001" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
              <p className="text-xs text-muted-foreground">1 {editing?.code} = {newRate || "0"} SAR</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveRate}>Save Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Currencies;
