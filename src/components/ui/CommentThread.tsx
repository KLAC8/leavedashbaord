'use client';

import { useState } from 'react';
import { Input } from './input';
import { Button } from './button';

export default function CommentThread() {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);

  function openComments(id: string, existing: string[] = []) {
    setRequestId(id);
    setComments(existing);
  }

  async function submitComment() {
    if (!requestId || !newComment.trim()) return;
    const res = await fetch(`/api/leave/${requestId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text: newComment }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setComments(prev => [...prev, newComment]);
      setNewComment('');
    }
  }

  if (typeof window !== 'undefined') {
    (window as any).openCommentThread = openComments;
  }

  return requestId ? (
    <div className="p-4 border rounded bg-white mt-4">
      <h3 className="font-bold mb-2">Comments</h3>
      <ul className="space-y-1 mb-3">
        {comments.map((c, i) => (
          <li key={i} className="text-sm text-gray-700">– {c}</li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <Input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button onClick={submitComment}>Send</Button>
      </div>
    </div>
  ) : null;
}
