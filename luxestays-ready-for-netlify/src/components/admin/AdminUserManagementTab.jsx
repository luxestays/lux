import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Users, UserPlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const AdminUserManagementTab = ({ otherAdmins, currentAdminRole }) => {
  const { toast } = useToast();
  const CEO_ROLE = "CEO";

  const handleAddAdmin = () => {
    if (currentAdminRole !== CEO_ROLE) {
      toast({ variant: "destructive", title: "Permission Denied", description: "Only CEO can add new admins." });
      return;
    }
    toast({ title: "Feature In Development", description: "Managing admin users with Supabase Auth requires further setup for roles and permissions." });
  };

  return (
    <Card className="shadow-lg border border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><Users className="mr-2 text-accent"/>Admin User Management</CardTitle>
        <CardDescription>Manage admin accounts and their permissions. (Full functionality requires Supabase Auth setup)</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddAdmin} className="mb-4 bg-accent/80 hover:bg-accent/90 text-accent-foreground">
          <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
        </Button>
        <div className="space-y-3">
          {otherAdmins.map(admin => (
            <Card key={admin.id} className="p-3 bg-secondary/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 rounded-md">
              <div>
                <p className="font-semibold text-foreground">{admin.username} <span className="text-xs text-muted-foreground">({admin.email})</span></p>
                <p className="text-xs text-muted-foreground">Role: {admin.role} {admin.resortId ? `(Resort ID: ${admin.resortId})` : ''}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(admin.permissions || []).map(p => <Badge key={p} variant="outline" className="text-xs">{p.replace(/_/g, ' ')}</Badge>)}
                </div>
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Admin (Soon)", description: "Functionality to edit admin roles requires Supabase Auth setup." })}><Edit className="h-4 w-4"/></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the admin account (simulation only).
                        Actual deletion requires Supabase Auth setup.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => toast({ title: "Remove Admin (Simulated)", description: `${admin.username} would be removed with Supabase Auth setup.` })}>
                        Proceed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center pt-6">Full user management with roles and permissions will be available after Supabase Auth and RLS policies are fully configured.</p>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagementTab;