import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchApi } from '@/lib/api';
import { localizeNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { Users, Ban, CheckCircle, Edit, UserX, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UserManagement() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchApi('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleBan = async (userId, currentBanStatus) => {
    try {
      await fetchApi(`/admin/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ is_banned: !currentBanStatus })
      });
      toast.success(currentBanStatus ? 'User unbanned' : 'User banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await fetchApi(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      toast.success('User role updated');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-500 text-white',
      worker: 'bg-blue-500 text-white',
      scrap_dealer: 'bg-emerald-500 text-white',
      resident: 'bg-slate-500 text-white'
    };
    return colors[role] || 'bg-slate-500 text-white';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 text-xl font-bold">
            <Users className="h-5 w-5 text-emerald-600" />
            {t('admin.users') || 'User Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.userName') || 'Name'}</TableHead>
                <TableHead>{t('worker.email') || 'Email'}</TableHead>
                <TableHead>{t('worker.status') || 'Role'}</TableHead>
                <TableHead>{t('dashboard.credits') || 'Credits'}</TableHead>
                <TableHead>{t('admin.status') || 'Status'}</TableHead>
                <TableHead>{t('worker.date') || 'Joined'}</TableHead>
                <TableHead>{t('worker.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900">{user.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {localizeNumber(user.credits || 0, i18n.language)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_banned ? 'destructive' : 'default'} className="gap-1">
                      {user.is_banned ? (
                        <>
                          <UserX className="w-3 h-3" /> Banned
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3" /> Active
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString(i18n.language) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('common.edit') || 'Edit User Role'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm text-slate-600 mb-2">
                                {user.full_name || user.email}
                              </p>
                              <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="resident">Resident</SelectItem>
                                  <SelectItem value="worker">Worker</SelectItem>
                                  <SelectItem value="scrap_dealer">Scrap Dealer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={() => editingUser && updateRole(editingUser.id, newRole)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {t('common.save') || 'Update Role'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant={user.is_banned ? 'outline' : 'destructive'}
                        onClick={() => toggleBan(user.id, user.is_banned)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
