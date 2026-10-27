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
  home2: {
    brandKicker: 'EOS / OPERATIONS', brandTitle: 'Parking command room', online: 'System online', healthy: 'All services are stable', currentParking: 'Active parking', chooseParking: 'Choose parking', navigation: 'Navigation', collapse: 'Collapse navigation', expand: 'Expand navigation', language: 'Change language', appearance: 'Change appearance', profile: 'User profile', changePassword: 'Change password', theme: 'Appearance settings', logout: 'Sign out', commandCenter: 'Command center', commandSubtitle: 'Live operations and key parking indicators', liveOverview: 'Live overview', operationalPulse: 'Operational pulse', lastSync: 'Last sync just now', capacity: 'Total capacity', occupied: 'Occupied', available: 'Available', trafficVolume: "Today's traffic", gateStatus: 'Gate status', allGatesReady: 'All gates are ready', openGates: 'Active gate', spaceMap: 'Parking bay map', freeSpace: 'Available bay', occupiedSpace: 'Occupied bay', selectedSpace: 'Selected bay', selectedBay: 'Selected bay', quickActions: 'Quick actions', openTraffic: 'View traffic', openMembers: 'Manage members', openMonitoring: 'Open monitoring', openReports: 'Operational reports', today: 'Today', comparedToYesterday: 'Compared with yesterday', increase: 'Increase', entry: 'Entry', exit: 'Exit', peakHour: 'Peak hour', activity: 'Recent activity', activityOne: 'New traffic recorded at north gate', activityTwo: 'A vehicle membership was renewed', activityThree: 'Daily report is ready to view', justNow: 'Just now', minutesAgo: 'minutes ago', hourAgo: 'One hour ago', viewAllActivity: 'View all activity', tabs: 'Open tabs', closeTab: 'Close tab', home: 'Dashboard', systemStatus: 'System status', commandCode: 'COMMAND / 02', mapLegend: 'Map legend', gateNorth: 'North gate', gateSouth: 'South gate', stable: 'Stable', attention: 'Needs review', noParking: 'No parking is available to display.', parkingLoadError: 'Loading the parking list failed.', retry: 'Retry', selectAction: 'Choose an operation', occupancyRate: 'Occupancy rate', freeCount: 'Bays remaining', totalTraffic: 'Total traffic', monitoring: 'Monitoring', systemMenu: 'System management', parkingDefinitions: 'Parking definitions', reports: 'Reports', menuHome: 'Home', modeTabs: 'Tabbed mode', modeClassic: 'Classic mode',
  },
} as const;

export default en;
