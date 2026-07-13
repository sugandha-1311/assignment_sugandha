import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './modal';
import { Button } from './button';
import { toast } from 'sonner';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: any;
  groupId: string | null;
}

export function ExpenseModal({ isOpen, onClose, onSuccess, expense, groupId }: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [payer, setPayer] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!groupId) return;
        try {
            const res = await axios.get(`http://localhost:8000/balances/group/${groupId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const fetchedUsers = Object.keys(res.data).map(id => ({ id }));
            setUsers(fetchedUsers);
            if (fetchedUsers.length > 0 && !expense) {
                setPayer(fetchedUsers[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };
    if (isOpen) fetchUsers();
  }, [groupId, isOpen]);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.converted_amount.toString());
      setDate(expense.expense_date.split('T')[0]);
      setPayer(expense.payer_id);
    } else {
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      if (users.length > 0) setPayer(users[0].id);
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !payer) return;
    setLoading(true);
    
    const splitData = {
        user_id: payer,
        amount: parseFloat(amount)
    };

    try {
      const token = localStorage.getItem('token');
      if (expense?.id) {
        await axios.put(`http://localhost:8000/expenses/${expense.id}`, { 
            title, 
            original_amount: parseFloat(amount),
            converted_amount: parseFloat(amount),
            expense_date: date
            // omitting splits for updates to keep it simple, it'll just update amounts
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:8000/expenses`, { 
            group_id: groupId,
            payer_id: payer,
            title,
            original_amount: parseFloat(amount),
            original_currency: 'INR',
            converted_amount: parseFloat(amount),
            expense_date: date,
            split_type: 'EntryType.EQUAL',
            splits: [splitData]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast.success(expense ? 'Expense updated successfully' : 'Expense added successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={expense ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Paid By</label>
          <select 
            required 
            className="w-full px-3 py-2 border rounded-md bg-white"
            value={payer}
            onChange={e => setPayer(e.target.value)}
          >
            <option value="" disabled>Select user...</option>
            {users.map(u => (
                <option key={u.id} value={u.id}>{u.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input 
            type="text" 
            required 
            className="w-full px-3 py-2 border rounded-md"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount (INR)</label>
          <input 
            type="number" 
            step="0.01"
            required 
            className="w-full px-3 py-2 border rounded-md"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input 
            type="date" 
            required 
            className="w-full px-3 py-2 border rounded-md"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || !groupId}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
