import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './modal';
import { Button } from './button';

interface Group {
  id?: string;
  name: string;
  description?: string;
}

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: Group | null;
}

export function GroupModal({ isOpen, onClose, onSuccess, group }: GroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (group?.id) {
        await axios.put(`http://localhost:8000/groups/${group.id}`, { name, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:8000/groups`, { name, description }, {
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
      title={group ? 'Edit Group' : 'Create Group'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Group Name</label>
          <input 
            type="text" 
            required 
            className="w-full px-3 py-2 border rounded-md"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            className="w-full px-3 py-2 border rounded-md"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
