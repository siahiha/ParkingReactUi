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
  profile: {
    changePassword: 'Change password', saving: 'Saving...', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', passwordRequired: 'Complete all three password fields.', passwordMismatch: 'The confirmation does not match the new password.', passwordChanged: 'Password changed successfully.', passwordError: 'Password change failed. Check the entered values or service connection.',
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
    dayMode: 'Day mode', nightMode: 'Night mode',
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
brandKicker: 'EOS / OPERATIONS', brandTitle: 'Parking Management System', online: 'System online', healthy: 'All services are stable', currentParking: 'Active parking', chooseParking: 'Choose parking', navigation: 'Navigation', collapse: 'Collapse navigation', expand: 'Expand navigation', language: 'Change language', appearance: 'Change appearance', profile: 'User profile', changePassword: 'Change password', theme: 'Appearance settings', logout: 'Sign out', commandCenter: 'Command center', managementPrefix: 'Management', commandSubtitle: 'Live operations and key parking indicators', liveOverview: 'Live overview', operationalPulse: 'Operational pulse', lastSync: 'Last sync just now', capacity: 'Total capacity', occupied: 'Occupied', available: 'Available', trafficVolume: "Today's traffic", trafficToday: "Today's traffic", lastTraffic: 'Last traffic', gateStatus: 'Gate status', doorCount: 'Door count', serverTime: 'Server time', deviceInfo: 'Device information', deviceInfoUnavailable: 'No information recorded', parkingInfoLoadError: 'Updating parking information failed.', refresh: 'Refresh parking information', allGatesReady: 'All gates are ready', openGates: 'Active gate', spaceMap: 'Parking bay map', freeSpace: 'Available bay', occupiedSpace: 'Occupied bay', selectedSpace: 'Selected bay', selectedBay: 'Selected bay', quickActions: 'Quick actions', openTraffic: 'View traffic', openMembers: 'Manage members', openMonitoring: 'Open monitoring', openReports: 'Operational reports', today: 'Today', comparedToYesterday: 'Compared with yesterday', increase: 'Increase', entry: 'Entry', exit: 'Exit', peakHour: 'Peak hour', activity: 'Recent activity', activityOne: 'New traffic recorded at north gate', activityTwo: 'A vehicle membership was renewed', activityThree: 'Daily report is ready to view', justNow: 'Just now', minutesAgo: 'minutes ago', hourAgo: 'One hour ago', viewAllActivity: 'View all activity', tabs: 'Open tabs', closeTab: 'Close tab', home: 'Dashboard', systemStatus: 'System status', commandCode: 'COMMAND / 02', mapLegend: 'Map legend', gateNorth: 'North gate', gateSouth: 'South gate', stable: 'Stable', attention: 'Needs review', noParking: 'No parking is available to display.', parkingLoadError: 'Loading the parking list failed.', retry: 'Retry', selectAction: 'Choose an operation', occupancyRate: 'Occupancy rate', freeCount: 'Bays remaining', totalTraffic: 'Total traffic', monitoring: 'Monitoring', systemMenu: 'System management', parkingDefinitions: 'Parking definitions', reports: 'Reports', menuHome: 'Home', modeTabs: 'Tabbed mode', modeClassic: 'Classic mode',
    smartInfrastructure: 'Smart Traffic and Parking Infrastructure',
  },
  home3Menu: {
    groups: { definitions: 'Parking definitions and settings', operations: 'Parking operations', integrations: 'System integrations', reports: 'Reports', 'member-reports': 'Member reports', 'traffic-reports': 'Traffic reports', 'financial-reports': 'Financial reports', 'other-reports': 'Other', 'management-reports': 'Management reports' },
    items: { list: 'Parkings', users: 'Users and access', access: 'Access levels', exit: 'Exit permission', 'parking-details': 'Parking details', equipment: 'Equipment', 'space-types': 'Parking space types', floors: 'Floors and divisions', zones: 'Parking zones', doors: 'Parking doors', 'member-kinds': 'Membership types', tariffs: 'Tariffs', cards: 'Card management', members: 'Membership and registration', monitoring: 'Monitoring', shifts: 'Assign shift', 'manual-traffic': 'Entry and exit control', 'traffic-records': 'Manage entries and exits', 'anpr-monitoring': 'ANPR monitoring', 'integration-settings': 'Integration settings', 'ets-import': 'Update members from ETS', 'excel-import': 'Import personnel from Excel', 'member-report': 'Member report', 'active-member-report': 'Members with active membership', 'inactive-member-report': 'Members without active membership', 'member-register-history': 'Member membership history', 'traffic-reports-list': 'Vehicle entry and exit', 'door-traffic-reports': 'Daily door traffic', 'average-parking-time': 'Average vehicle parking time', 'parking-income': 'Parking income', 'monthly-parking-income': 'Monthly parking income comparison', 'member-cash': 'Member cash flow', 'user-performance': 'User financial performance', 'membership-income': 'Membership sales income details', 'cargo-details': 'Cargo details report', 'management-monthly-income-comparison': 'Monthly parking income comparison', 'management-income-comparison': 'Parking income comparison', 'management-yearly-income-comparison': 'Yearly parking income comparison', 'management-user-performance': 'User financial performance', 'management-free-parking-income': 'Free-parking income details' },
  },
} as const;

export default en;
