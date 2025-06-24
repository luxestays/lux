import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, UserCog } from 'lucide-react';

import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminResortsTab from '@/components/admin/AdminResortsTab';
import AdminUserManagementTab from '@/components/admin/AdminUserManagementTab';
import WebsiteSettingsTab from '@/components/admin/WebsiteSettingsTab';

const AdminDashboardPage = ({ adminUser }) => {
  const CEO_ROLE = "CEO";
  const currentAdminRole = adminUser?.role || CEO_ROLE;
  const currentAdminResortId = adminUser?.resortId || null;

  const [activeTab, setActiveTab] = useState("overview");
  
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, monthlyChange: 0, bookings: 0 });
  const [otherAdmins, setOtherAdmins] = useState([
    { id: 'admin_founder_001', username: 'LuxeStaysCEO', email: 'ceo@luxestays.com', role: CEO_ROLE, permissions: ['all_access'], resortId: null },
  ]);
  const [resorts, setResorts] = useState([]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <Badge variant={currentAdminRole === CEO_ROLE ? "default" : "secondary"} className="mt-1">
            {currentAdminRole === CEO_ROLE ? <ShieldAlert className="h-4 w-4 mr-1.5"/> : <UserCog className="h-4 w-4 mr-1.5"/>}
            Logged in as: {adminUser?.username} ({currentAdminRole})
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-muted/50 p-1.5 rounded-lg">
          <TabsTrigger value="overview" className="text-sm md:text-base">Overview</TabsTrigger>
          <TabsTrigger value="manage-resorts" className="text-sm md:text-base">
            {currentAdminRole === CEO_ROLE ? "Manage All Resorts" : "Manage My Resort"}
          </TabsTrigger>
          {currentAdminRole === CEO_ROLE && (
            <>
              <TabsTrigger value="user-management" className="text-sm md:text-base">User Management</TabsTrigger>
              <TabsTrigger value="website-settings" className="text-sm md:text-base">Website Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewTab
            revenueData={revenueData}
            adminUser={adminUser}
            resorts={resorts}
            setActiveTab={setActiveTab}
            currentAdminRole={currentAdminRole}
            currentAdminResortId={currentAdminResortId}
          />
        </TabsContent>

        <TabsContent value="manage-resorts">
          <AdminResortsTab adminUser={adminUser} />
        </TabsContent>
        
        {currentAdminRole === CEO_ROLE && (
          <>
            <TabsContent value="user-management">
              <AdminUserManagementTab otherAdmins={otherAdmins} currentAdminRole={currentAdminRole} />
            </TabsContent>
            <TabsContent value="website-settings">
              <WebsiteSettingsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboardPage;