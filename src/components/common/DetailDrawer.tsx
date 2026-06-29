import type { ReactNode } from 'react';
import { Drawer, Box, IconButton, Tabs, Tab, Divider } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

export interface DetailDrawerTab {
  label: string;
  content: ReactNode;
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  tabs: DetailDrawerTab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  footer?: ReactNode;
  width?: number;
}

export function DetailDrawer({ open, onClose, header, tabs, activeTab, onTabChange, footer, width = 420 }: DetailDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>{header}</Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>
        <Tabs value={activeTab} onChange={(_, value) => onTabChange(value)} variant="scrollable" sx={{ px: 1.5, minHeight: 40 }}>
          {tabs.map((tab) => (
            <Tab key={tab.label} label={tab.label} sx={{ minHeight: 40, fontSize: 13 }} />
          ))}
        </Tabs>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>{tabs[activeTab]?.content}</Box>
        {footer && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>{footer}</Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
