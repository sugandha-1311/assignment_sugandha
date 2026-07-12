import { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { DataTable, Column } from './components/ui/data-table';
import { EmptyState } from './components/ui/empty-state';
import { Link } from 'react-router-dom';
import { ExpenseModal } from './components/ui/expense-modal';
import { useGlobal } from './context/GlobalContext';
import { Edit, Trash2 } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const { refreshKey, triggerRefresh } = useGlobal();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const groupsRes = await axios.get('http://localhost:8000/groups', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const groups = groupsRes.data;
        const gId = groups.length > 0 ? groups[0].id : null;
        setGroupId(gId);

        if (gId) {
          const res = await axios.get(`http://localhost:8000/expenses/${gId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setExpenses(res.data);
        } else {
          setExpenses([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`http://localhost:8000/expenses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  const columns: Column<any>[] = [
    { header: "Date", accessorKey: "expense_date", sortable: true, cell: (item) => new Date(item.expense_date).toLocaleDateString() },
    { header: "Title", accessorKey: "title", sortable: true, cell: (item) => <span className="font-medium text-slate-900">{item.title}</span> },
    { header: "Payer", accessorKey: "payer_id", sortable: true },
    { header: "Amount", accessorKey: "converted_amount", sortable: true, cell: (item) => `₹${item.converted_amount}` },
    { header: "Split Type", accessorKey: "split_type", sortable: true },
    { 
      header: "Action", 
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-2">
            <Link to={`/expenses/${item.id}`}>
              <Button variant="outline" size="sm">View DNA</Button>
            </Link>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" onClick={() => handleEdit(item)}>
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">All transactions within the current group.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {expenses.length === 0 && !loading ? (
        <EmptyState
          icon={Receipt}
          title="No Expenses Yet"
          description="Create an expense or import a file to begin."
          actionLabel="Add Expense"
          disabled={true}
        />
      ) : (
        <Card className="premium-card">
          <CardContent className="p-0">
            {loading ? (
               <div className="p-12 text-center text-muted-foreground animate-pulse">Loading expenses...</div>
            ) : (
               <div className="p-6">
                  <DataTable data={expenses} columns={columns} searchPlaceholder="Search expenses..." />
               </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <ExpenseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={triggerRefresh} 
        expense={selectedExpense} 
        groupId={groupId}
      />
    </div>
  );
}
