"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Loader2,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Search,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const token = getCookie("token");
    try {
      const res = await fetch(
        "https://admin-crm.onrender.com/api/staff/all-admins",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (a) =>
        `${a.first_name} ${a.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, admins]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase italic">
            Tizim Adminlari
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Yuqori darajadagi adminlar boshqaruvi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Admin qidirish..."
              className="pl-10 w-full md:w-64 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-11 font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                <UserPlus className="h-4 w-4 mr-2" /> Qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] dark:bg-slate-950 p-8 border-none shadow-2xl">
              <DialogHeader>
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7 text-indigo-500" />
                </div>
                <DialogTitle className="text-2xl font-bold">
                  Admin Qo'shish
                </DialogTitle>
                <DialogDescription>
                  Yangi admin ma'lumotlarini kiriting.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="First Name" className="rounded-xl h-11" />
                <Input placeholder="Last Name" className="rounded-xl h-11" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="rounded-xl h-11"
                />
                <Select>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Role tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="password"
                  placeholder="Parol"
                  className="rounded-xl h-11"
                />
              </div>
              <DialogFooter>
                <Button className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-bold transition-all">
                  Saqlash
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-6 px-8 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                Admin
              </TableHead>
              <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                Email
              </TableHead>
              <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-right pr-10 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">
                Amallar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow
                  key={admin._id}
                  className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300 group"
                >
                  <TableCell className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                        {admin.first_name?.[0]}
                        {admin.last_name?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {admin.first_name} {admin.last_name}
                        </span>
                        <Badge
                          variant="outline"
                          className="w-fit text-[9px] mt-1 h-5 px-2 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100"
                        >
                          ADMIN
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {admin.status || "faol"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 transition-all"
                        >
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 p-2 rounded-2xl shadow-2xl border-slate-200/60 backdrop-blur-xl"
                      >
                        <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-indigo-50 transition-colors">
                          <Edit className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-sm">
                            Tahrirlash
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 opacity-50" />
                        <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-rose-50 text-rose-600">
                          <Trash2 className="h-4 w-4" />
                          <span className="font-semibold text-sm">
                            O'chirish
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
