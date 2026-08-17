import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api';
import { localizeNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { Coins, Plus, Minus } from 'lucide-react';

export default function CreditsManagement() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    reason: '',
    type: 'add'
  });

  useEffect(() => {
    fetchUsers();
    fetchAuditLog();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchApi('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuditLog = async () => {
    try {
      const data = await fetchApi('/admin/credits/logs');
      setAuditLog(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseInt(formData.amount);
    if (!amount || !formData.userId || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    const finalAmount = formData.type === 'subtract' ? -amount : amount;
    
    try {
      await fetchApi('/admin/credits', {
        method: 'POST',
        body: JSON.stringify({
          userId: formData.userId,
          amount: finalAmount,
          reason: formData.reason,
          type: formData.type
        })
      });

      toast.success(`Credits ${formData.type === 'add' ? 'added' : 'subtracted'} successfully`);
      fetchUsers();
      fetchAuditLog();
      setOpen(false);
      setFormData({ userId: '', amount: '', reason: '', type: 'add' });
    } catch (error) {
      console.error('Error managing credits:', error);
      toast.error('Failed to update credits');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900 text-xl font-bold">
            <Coins className="h-5 w-5 text-emerald-600" />
            {t('admin.credits') || 'Credits & Penalties Management'}
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <Coins className="h-4 w-4 mr-2" />
                {t('admin.credits') || 'Manage Credits'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.credits') || 'Add or Subtract Credits'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t('admin.users') || 'Select User'} *</Label>
                  <Select value={formData.userId} onValueChange={(val) => setFormData({...formData, userId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email} ({localizeNumber(user.credits || 0, i18n.language)} {t('dashboard.credits')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('worker.actions') || 'Action Type'} *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-emerald-600" />
                          <span>Add Credits</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-500" />
                          <span>Subtract Credits (Penalty)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Reason *</Label>
                  <Textarea
                    required
                    placeholder="Explain why credits are being added or subtracted..."
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {formData.type === 'add' ? 'Add Credits' : 'Apply Penalty'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <h3 className="text-base font-bold text-slate-900 mb-4">{t('admin.recentActivity') || 'Credit Audit Log'}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('worker.date') || 'Date'}</TableHead>
                <TableHead>{t('admin.userName') || 'User'}</TableHead>
                <TableHead>{t('admin.actions') || 'Action'}</TableHead>
                <TableHead>{t('dashboard.credits') || 'Amount'}</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-slate-600">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString(i18n.language) : '—'}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {log.users?.full_name || log.users?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.action_type === 'add' ? 'default' : 'destructive'}>
                      {log.action_type === 'add' ? 'Credit Added' : 'Penalty Applied'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={log.amount > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {log.amount > 0 ? '+' : ''}{localizeNumber(log.amount, i18n.language)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-700">{log.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
