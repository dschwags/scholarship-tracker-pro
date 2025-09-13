'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Settings, Mail, Calendar, CheckCircle, Clock, XCircle, UserPlus, UserMinus } from 'lucide-react';
import { getUserConnections } from '@/lib/actions/parent-linking';
// import { removeCollaborator } from '@/lib/actions/user-management';
import { InviteParentModal } from './invite-parent-modal';
import InviteStudentModal from './invite-student-modal';
import { toast } from 'sonner';
import { getAlternatingRowClasses } from '@/lib/utils/alternating-colors';

interface Connection {
  id: number;
  connectionType: string;
  permissions: any;
  createdAt: string;
  isActive: boolean;
  childUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  parentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface ConnectionsData {
  asParent: Connection[];
  asChild: Connection[];
}

export function ConnectionsDashboard() {
  const [connections, setConnections] = useState<ConnectionsData>({ asParent: [], asChild: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'parents'>('overview');
  const [removingCollaborator, setRemovingCollaborator] = useState<number | null>(null);
  const [showInviteParentModal, setShowInviteParentModal] = useState(false);
  const [showInviteStudentModal, setShowInviteStudentModal] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await getUserConnections();
      setConnections(data as any);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (connectionId: number, collaboratorName: string) => {
    toast.info('Remove collaborator feature coming soon!');
    // if (!confirm(`Are you sure you want to remove ${collaboratorName} from your scholarship account? They will lose access immediately.`)) {
    //   return;
    // }
    // setRemovingCollaborator(connectionId);
    // try {
    //   const result = await removeCollaborator(connectionId);
    //   if (result.success) {
    //     toast.success(result.message);
    //     await loadConnections();
    //   } else {
    //     toast.error(result.message);
    //   }
    // } catch (error) {
    //   console.error('Error removing collaborator:', error);
    //   toast.error('Failed to remove collaborator');
    // } finally {
    //   setRemovingCollaborator(null);
    // }
  };

  const getConnectionStatusBadge = (connection: Connection) => {
    if (!connection.isActive) {
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
    return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const getConnectionTypeBadge = (type: string) => {
    const color = type === 'parent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    return (
      <Badge variant="secondary" className={color}>
        {type === 'parent' ? 'Parent/Guardian' : 'Counselor'}
      </Badge>
    );
  };

  const totalConnections = connections.asParent.length + connections.asChild.length;
  const activeConnections = connections.asParent.filter(c => c.isActive).length + 
                           connections.asChild.filter(c => c.isActive).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Family & Counselor Connections</h2>
          <p className="text-muted-foreground">
            Manage collaborative access to your scholarship applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2" 
            onClick={() => setShowInviteParentModal(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Parent/Counselor
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => setShowInviteStudentModal(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Student
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold">{totalConnections}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{activeConnections}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students I Help</p>
                <p className="text-2xl font-bold text-purple-600">{connections.asParent.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Overview
        </button>
        {connections.asChild.length > 0 && (
          <button
            onClick={() => setActiveTab('parents')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'parents'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            My Parents/Counselors ({connections.asChild.length})
          </button>
        )}
        {connections.asParent.length > 0 && (
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Students I Help ({connections.asParent.length})
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && totalConnections === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No connections yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start collaborating on scholarship applications by inviting parents, guardians, or counselors.
            </p>
            <InviteParentModal>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Your First Invitation
              </Button>
            </InviteParentModal>
          </CardContent>
        </Card>
      )}

      {activeTab === 'overview' && totalConnections > 0 && (
        <div className="space-y-4">
          {/* Recent Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connections.asChild.slice(0, 2).map((connection, index) => (
                  <div key={connection.id} className={getAlternatingRowClasses(index, {
                    className: "p-3 rounded border",
                    hoverEnabled: false
                  } as any)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {connection.parentUser?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {connection.parentUser?.name || 'Parent'} connected as your {connection.connectionType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getConnectionStatusBadge(connection)}
                    </div>
                  </div>
                ))}
                
                {connections.asParent.slice(0, 2).map((connection, index) => (
                  <div key={connection.id} className={getAlternatingRowClasses(index + connections.asChild.slice(0, 2).length, {
                    className: "p-3 rounded border",
                    hoverEnabled: false
                  } as any)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {connection.childUser?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            You connected to {connection.childUser?.name || 'Student'}&apos;s account
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getConnectionStatusBadge(connection)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'parents' && (
        <Card>
          <CardHeader>
            <CardTitle>Parents & Counselors Connected to You</CardTitle>
            <CardDescription>
              These people can view and edit your scholarship applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections.asChild.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No parents or counselors connected yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.asChild.map((connection, index) => (
                  <div key={connection.id} className={getAlternatingRowClasses(index, {
                    className: "p-4 rounded-lg border",
                    hoverEnabled: true
                  } as any)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {connection.parentUser?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{connection.parentUser?.name || 'Parent'}</h4>
                            {getConnectionTypeBadge(connection.connectionType)}
                            {getConnectionStatusBadge(connection)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {connection.parentUser?.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Connected {new Date(connection.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveCollaborator(connection.id, connection.parentUser?.name || 'Parent')}
                          disabled={removingCollaborator === connection.id}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove (Soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Students You&apos;re Helping</CardTitle>
            <CardDescription>
              Student accounts you have access to as a parent or counselor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections.asParent.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No student connections yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.asParent.map((connection, index) => (
                  <div key={connection.id} className={getAlternatingRowClasses(index, {
                    className: "p-4 rounded-lg border",
                    hoverEnabled: true
                  } as any)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {connection.childUser?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{connection.childUser?.name || 'Student'}</h4>
                            {getConnectionTypeBadge(connection.connectionType)}
                            {getConnectionStatusBadge(connection)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {connection.childUser?.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Connected {new Date(connection.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Modals */}
      <InviteParentModal 
        isOpen={showInviteParentModal} 
        onClose={() => setShowInviteParentModal(false)} 
      />
      <InviteStudentModal 
        isOpen={showInviteStudentModal} 
        onClose={() => setShowInviteStudentModal(false)} 
      />
    </div>
  );
}