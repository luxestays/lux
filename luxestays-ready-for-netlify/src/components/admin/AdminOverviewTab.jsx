import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';

const AdminOverviewTab = ({ revenueData, adminUser, resorts, setActiveTab, currentAdminRole, currentAdminResortId }) => {
  const CEO_ROLE = "CEO";

  const getResortSpecificRevenue = (resortId) => {
    const baseRevenue = revenueData.totalRevenue / (resorts.length || 1);
    const resort = resorts.find(r => r.id === resortId);
    const multiplier = resort ? (parseFloat(resort.rating) / 5) + 0.5 : 1;
    return (baseRevenue * multiplier).toFixed(0);
  };

  return (
    <>
      {currentAdminRole === CEO_ROLE ? (
        <Card className="shadow-lg mb-6 border border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><BarChart2 className="mr-2 text-accent"/>Overall Revenue (₹)</CardTitle>
            <CardDescription>Summary of financial performance for all resorts.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-accent">₹{revenueData.totalRevenue.toLocaleString('en-IN')}</p>
            </Card>
            <Card className="bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Change</p>
              <p className={`text-3xl font-bold ${revenueData.monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {revenueData.monthlyChange >= 0 ? '+' : ''}{revenueData.monthlyChange}%
              </p>
            </Card>
            <Card className="bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-foreground">{revenueData.bookings}</p>
            </Card>
          </CardContent>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">Detailed charts and reports coming soon with enhanced backend integration.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg mb-6 border border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><BarChart2 className="mr-2 text-accent"/>My Resort Revenue (₹)</CardTitle>
            <CardDescription>
              Performance for: {resorts.find(r => r.id === currentAdminResortId)?.name || "Your Resort"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentAdminResortId && resorts.find(r => r.id === currentAdminResortId) ? (
              <p className="text-3xl font-bold text-accent">
                ₹{getResortSpecificRevenue(currentAdminResortId).toLocaleString('en-IN')}
                <span className="text-sm text-muted-foreground ml-2">(estimated total)</span>
              </p>
            ) : (
              <p className="text-muted-foreground">No resort assigned or data unavailable.</p>
            )}
            <p className="text-sm text-muted-foreground text-center pt-6">Individual resort analytics and real-time availability will be enhanced with further backend integration.</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => setActiveTab("manage-resorts")}>
            {currentAdminRole === CEO_ROLE ? "Manage All Resorts" : "Manage My Resort"}
          </Button>
          {currentAdminRole === CEO_ROLE && (
            <Button variant="outline" onClick={() => setActiveTab("user-management")}>Manage Users</Button>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminOverviewTab;