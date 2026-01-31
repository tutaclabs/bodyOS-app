import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../../ui/theme';

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

  let backgroundColor, textColor, label;
  
  if (daysUntilExpiry < 0) {
    backgroundColor = '#DC2626';
    textColor = '#FFFFFF';
    label = 'Expired';
  } else if (daysUntilExpiry <= 7) {
    backgroundColor = '#F59E0B';
    textColor = '#FFFFFF';
    label = daysUntilExpiry === 0 ? 'Expires Today' : `${daysUntilExpiry}d left`;
  } else if (daysUntilExpiry <= 30) {
    backgroundColor = '#EAB308';
    textColor = '#000000';
    label = `${daysUntilExpiry}d left`;
  } else {
    backgroundColor = '#10B981';
    textColor = '#FFFFFF';
    label = `${daysUntilExpiry}d left`;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor,
        borderRadius: 6,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
