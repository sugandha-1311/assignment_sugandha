import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, ChevronRight, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { EmptyState } from './components/ui/empty-state';
import { GroupModal } from './components/ui/group-modal';
import { useGlobal } from './context/GlobalContext';

export default function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const { refreshKey, triggerRefresh } = useGlobal();

  useEffect(() => {
    // For demo purposes, we fetch all groups. The backend currently doesn't have a GET /groups endpoint that returns all groups,
    // but we can simulate it or rely on the demo-group-1 we seeded.
    // Wait, the backend actually DOES have GET /groups in group.py:
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:8000/groups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [refreshKey]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`http://localhost:8000/groups/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (e: React.MouseEvent, group: any) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedGroup(null);
    setModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
          <p className="text-muted-foreground mt-1">Manage shared workspaces and member access.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Create Group
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Card key={group.id} className="premium-card group cursor-pointer hover:border-indigo-200 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600" onClick={(e) => handleEdit(e, group)}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600" onClick={(e) => handleDelete(e, group.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{group.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{group.description || 'No description provided'}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-600">{group.members?.length || 0} Members</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full">
              <EmptyState 
                icon={FolderOpen}
                title="No Groups Yet"
                description="Create your first shared expense group to start tracking expenses."
                actionLabel="Create Group"
                disabled={true}
              />
            </div>
          )}
        </div>
      )}
      
      <GroupModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={triggerRefresh} 
        group={selectedGroup} 
      />
    </div>
  );
}
