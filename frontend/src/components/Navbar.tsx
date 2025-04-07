import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PieChart, List, Bell, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "../context/NotificationContext";

const Navbar = ({ signOut }) => {
  const location = useLocation();
  const { notifications, markAllAsRead } = useNotifications();

  // Determine if there are any unread notifications.
  const hasNotifications = notifications.some((n) => !n.read);

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Analytics", icon: PieChart, href: "/analytics" },
    { title: "Transactions", icon: List, href: "/transactions" },
  ];

  return (
    <nav className="bg-dashboard-card border-b border-white/10 p-4 sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
                <span className="text-white font-bold text-lg">ET</span>
                <div className="absolute inset-0 bg-black opacity-20 mix-blend-overlay"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    location.pathname === item.href 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.title}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                  {hasNotifications && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass-card">
                <div className="p-4">
                  <h3 className="font-medium mb-2 text-gradient">Notifications</h3>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-gray-400">
                      <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <ul>
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className={`border-b border-gray-700 py-2 text-sm ${
                            notification.read ? "text-gray-400" : "text-white"
                          }`}
                        >
                          {notification.message}
                          <span className="block text-xs text-gray-500">
                            {notification.createdAt.toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                      <button
                        className="mt-2 text-xs text-blue-400 hover:underline"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    </ul>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card">
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
