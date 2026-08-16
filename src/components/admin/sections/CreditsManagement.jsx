import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Coins, Plus, Minus } from 'lucide-react';

export default function CreditsManagement() {
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
      const data = await fetchApi('/api/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuditLog = async () => {
    try {
      const data = await fetchApi('/api/admin/credits/logs');
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
      await fetchApi('/api/admin/credits', {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credits & Penalties Management
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Coins className="h-4 w-4 mr-2" />
                Manage Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add or Subtract Credits</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Select User *</Label>
                  <Select value={formData.userId} onValueChange={(val) => setFormData({...formData, userId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email} ({user.credits || 0} credits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action Type *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-500" />
                          Add Credits
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-500" />
                          Subtract Credits (Penalty)
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
                    Cancel
                  </Button>
                  <Button type="submit">
                    {formData.type === 'add' ? 'Add Credits' : 'Apply Penalty'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Credit Audit Log</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.users?.full_name || log.users?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.action_type === 'add' ? 'default' : 'destructive'}>
                      {log.action_type === 'add' ? 'Credit Added' : 'Penalty Applied'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={log.amount > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
