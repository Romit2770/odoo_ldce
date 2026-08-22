import React from 'react';
import { Users, Search, Shield, User, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const AdminUsersPage: React.FC = () => {
  const users = [
    { id: 'usr_1', name: 'Alex Johnson', email: 'alex.traveler@example.com', role: 'admin', tripsCount: 4, joined: 'Aug 2026' },
    { id: 'usr_2', name: 'Elena Rostova', email: 'elena@example.com', role: 'user', tripsCount: 2, joined: 'Aug 2026' },
    { id: 'usr_3', name: 'Devin Thorne', email: 'devin@example.com', role: 'user', tripsCount: 7, joined: 'Jul 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users Directory</h1>
          <p className="text-xs text-slate-400">View and manage registered traveler accounts and roles</p>
        </div>
        <div className="w-72">
          <Input placeholder="Search users by name or email..." icon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <Card className="bg-slate-850 border-slate-800 text-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Trips Created</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === 'admin' ? 'warning' : 'secondary'} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{u.tripsCount}</td>
                  <td className="p-4 text-slate-400">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
