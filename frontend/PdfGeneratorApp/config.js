// API Configuration
// IMPORTANT: 
// - For web browser: Uses 'http://localhost:5000/api' automatically
// - For physical device/emulator: Uses your computer's IP address automatically
// 
// To find your IP address manually:
// Windows: Run 'ipconfig' in CMD and use the IPv4 address
// Mac/Linux: Run 'ifconfig' and use the inet address

import { Platform } from 'react-native';

// Your computer's local IP address (update this if your IP changes)
const LOCAL_IP = '192.168.1.39';

// Automatically use localhost for web, IP address for mobile/emulator
export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : `http://${LOCAL_IP}:5000/api`;

