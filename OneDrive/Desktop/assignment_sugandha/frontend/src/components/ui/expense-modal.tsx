import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './modal';
import { Button } from './button';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.converted_amount.toString());
      setDate(expense.expense_date.split('T')[0]);
    } else {
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    setLoading(true);
    
    // Hardcode splits to single payer for simplicity of manual entry
    // In a real app this would be a complex splits selector
    const currentUser = localStorage.getItem('token') || 'sugandha@fairshare.app';
    const splitData = {
        user_id: currentUser,
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
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
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
