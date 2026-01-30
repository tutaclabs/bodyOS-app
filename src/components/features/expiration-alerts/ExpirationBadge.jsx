import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function ExpirationBadge({ expirationDate, reconstitutionDate, expirationDays = 30 }) {
  if (!expirationDate && !reconstitutionDate) {
    return null;
  }

  const now = new Date();
  let expDate = expirationDate ? new Date(expirationDate) : null;
  
  if (!expDate && reconstitutionDate) {
    const reconDate = new Date(reconstitutionDate);
    reconDate.setDate(reconDate.getDate() + expirationDays);
    expDate = reconDate;
  }

  if (!expDate) return null;

  const daysUntilExpiry = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
        <AlertCircle size={12} />
        Expired
      </span>
    );
  }

  if (daysUntilExpiry <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
        <AlertCircle size={12} />
        {daysUntilExpiry === 0 ? 'Expires Today' : `${daysUntilExpiry}d left`}
      </span>
    );
  }

  if (daysUntilExpiry <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
        <CheckCircle size={12} />
        {daysUntilExpiry}d left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
      <CheckCircle size={12} />
      {daysUntilExpiry}d left
    </span>
  );
}
