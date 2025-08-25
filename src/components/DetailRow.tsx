import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
};

export default DetailRow;

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.black,
    minWidth: moderateScale(100),
    marginRight: moderateScale(12),
  },
  detailValue: {
    fontSize: moderateScale(14),
    color: Colors.black,
    opacity: 0.7,
    flex: 1,
    lineHeight: moderateScale(20),
  },
});
