"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Users, ShieldCheck } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit user role
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState("USER");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&size=20`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.content);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all registered users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>All Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>${parseFloat(u.walletBalance).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={u.isVerified ? "success" : "outline"}>
                        {u.isVerified ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditUser(u);
                          setNewRole(u.role);
                        }}
                      >
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            User: <strong>{editUser?.name}</strong> ({editUser?.email})
          </p>
          <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleUpdateRole} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
