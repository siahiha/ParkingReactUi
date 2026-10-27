const en = {
  common: {
    floor: 'Floor',
    parkingSpace: 'Parking space',
    parkingSpaces: 'Parking spaces',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    backHome: 'Back to home',
  },
  auth: {
    ssoLoading: 'Completing sign-in with the central system...',
    ssoFailed: 'Sign-in with the central system failed. Try again.',
  },
  theme: {
    settings: 'Appearance settings',
    colors: 'Color palette',
    lightPalette: 'Light mode palette',
    darkPalette: 'Dark mode palette',
    bluePalette: 'Enterprise blue',
    greenPalette: 'Operations green',
    slatePalette: 'Industrial slate',
    shape: 'Corner rounding',
    controlRadius: 'Control rounding',
    buttonRadius: 'Button rounding',
    popupRadius: 'Window rounding',
    radiusCompact: 'Compact',
    radiusStandard: 'Standard',
    radiusMedium: 'Medium',
    radiusExpanded: 'Expanded',
    radiusSoft: 'Soft',
    cancel: 'Cancel',
    apply: 'Apply changes',
  },
  access: {
    deleteConfirm: 'Are you sure you want to delete this access level?',
    deleteManyConfirm: 'Delete {{count}} selected access levels?',
  },
  parking: {
    deleteConfirm: 'Are you sure you want to delete this parking?',
  },
  users: {
    deleteConfirm: 'Are you sure you want to delete this user?',
    deleteManyConfirm: 'Delete {{count}} selected users?',
  },
  definitions: {
    add: 'New', edit: 'Edit', remove: 'Delete', refresh: 'Refresh', save: 'Save', cancel: 'Cancel', create: 'Add {{title}}', update: 'Edit {{title}}', empty: 'No records to display.', loading: 'Loading...', error: 'Loading this section failed.', required: 'Title is required.', removeConfirm: 'Delete the selected record?', used: 'This floor has assigned parking spaces and cannot be deleted.', memberKindUsed: 'A membership type that is in use cannot be deleted.', saved: 'Saved successfully.', deleted: 'Record deleted.', title: 'Title', description: 'Description', fee: 'Membership fee', duration: 'Duration (days)', creditType: 'Credit type', membershipType: 'Membership type', refund: 'Refund deadline (days)', tariffs: 'Related tariffs', creditValues: ['Credit', 'Long-time', 'Long-time credit'], membershipValues: ['Owner', 'Member with assigned space', 'Member without assigned space'], using: 'In use',
  },
} as const;

export default en;
