import React, { useState } from 'react';
import axios from 'axios';
import { Modal } from './modal';
import { Button } from './button';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string | null;
  users: any[];
}

export function SettleModal({ isOpen, onClose, onSuccess, groupId, users }: SettleModalProps) {
  const [payer, setPayer] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !payer || !receiver || !amount) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/balances/settle`, { 
          group_id: groupId,
          payer_id: payer,
          receiver_id: receiver,
          amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      onClose();
      setPayer('');
      setReceiver('');
      setAmount('');
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
      title="Settle Up"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Who is paying?</label>
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
          <label className="block text-sm font-medium mb-1">Who is receiving?</label>
          <select 
            required 
            className="w-full px-3 py-2 border rounded-md bg-white"
            value={receiver}
            onChange={e => setReceiver(e.target.value)}
          >
            <option value="" disabled>Select user...</option>
            {users.map(u => (
                <option key={u.id} value={u.id}>{u.id}</option>
            ))}
          </select>
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
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || !groupId || payer === receiver}>
            {loading ? 'Processing...' : 'Settle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
