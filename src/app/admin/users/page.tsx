"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Loader2,
  Users,
  ShieldCheck,
  Trash2,
  Pencil,
  KeyRound,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: string;
  lostMoney: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

type ModalType = "role" | "edit" | "password" | "delete" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  const [activeUser, setActiveUser] = useState<UserItem | null>(null);
  const [modal, setModal] = useState<ModalType>(null);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("USER");

  // Password reset state
  const [newPassword, setNewPassword] = useState("");

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

  const openModal = (type: ModalType, u: UserItem) => {
    setActiveUser(u);
    setModal(type);
    setFeedback(null);
    if (type === "edit") {
      setEditName(u.name);
      setEditPhone(u.phone || "");
      setEditRole(u.role);
    }
    if (type === "role") {
      setEditRole(u.role);
    }
    if (type === "password") {
      setNewPassword("");
    }
  };

  const closeModal = () => {
    setModal(null);
    setActiveUser(null);
    setFeedback(null);
  };

  const handleEdit = async () => {
    if (!activeUser) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          role: editRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ ok: true, msg: "User updated successfully." });
        fetchUsers();
        setTimeout(closeModal, 1000);
      } else {
        setFeedback({ ok: false, msg: data.message || "Update failed." });
      }
    } catch {
      setFeedback({ ok: false, msg: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!activeUser) return;
    if (!newPassword || newPassword.length < 6) {
      setFeedback({
        ok: false,
        msg: "Password must be at least 6 characters.",
      });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/users/${activeUser.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setFeedback({ ok: true, msg: "Password reset successfully." });
        setTimeout(closeModal, 1000);
      } else {
        setFeedback({ ok: false, msg: data.message || "Reset failed." });
      }
    } catch {
      setFeedback({ ok: false, msg: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeUser) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchUsers();
      } else {
        setFeedback({ ok: false, msg: data.message || "Delete failed." });
      }
    } catch {
      setFeedback({ ok: false, msg: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View, edit, and manage all registered users.
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
            <p className="text-center text-muted-foreground py-8">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Lost Money
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Joined
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {u.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === "ADMIN" ? "default" : "secondary"}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {parseFloat(u.lostMoney) > 0 ? (
                          <span className="text-red-500 font-medium">
                            -${parseFloat(u.lostMoney).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal("edit", u)}
                            title="Edit user"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal("password", u)}
                            title="Reset password"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Pwd</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openModal("delete", u)}
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={modal === "edit"} onOpenChange={(o) => !o && closeModal()}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone number (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
          {feedback && (
            <p
              className={`text-sm ${feedback.ok ? "text-green-600" : "text-red-500"}`}
            >
              {feedback.msg}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleEdit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={modal === "password"}
        onOpenChange={(o) => !o && closeModal()}
      >
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Reset password for <strong>{activeUser?.name}</strong> (
            {activeUser?.email})
          </p>
          <div className="space-y-2">
            <Label>New Password</Label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          {feedback && (
            <p
              className={`text-sm ${feedback.ok ? "text-green-600" : "text-red-500"}`}
            >
              {feedback.msg}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={modal === "delete"}
        onOpenChange={(o) => !o && closeModal()}
      >
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-2">
          <p className="text-sm">
            Are you sure you want to delete <strong>{activeUser?.name}</strong>{" "}
            ({activeUser?.email})?
          </p>
          <p className="text-sm text-red-500 font-medium">
            This action is permanent and cannot be undone. All their
            predictions, transactions and data will be deleted.
          </p>
          {feedback && <p className="text-sm text-red-500">{feedback.msg}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
