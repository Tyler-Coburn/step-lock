export const DEFAULT_STEP_GOAL = 5000;

export const SOCIAL_MEDIA_APPS = [
  { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android', emoji: '📸' },
  { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', emoji: '🎵' },
  { id: 'twitter', name: 'Twitter / X', packageName: 'com.twitter.android', emoji: '🐦' },
  { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana', emoji: '👥' },
  { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', emoji: '▶️' },
  { id: 'reddit', name: 'Reddit', packageName: 'com.reddit.frontpage', emoji: '🤖' },
  { id: 'snapchat', name: 'Snapchat', packageName: 'com.snapchat.android', emoji: '👻' },
];

export const STORAGE_KEYS = {
  STEP_GOAL: '@steplock/step_goal',
  LOCKED_APPS: '@steplock/locked_apps',
  TODAY_STEPS: '@steplock/today_steps',
  LAST_RESET_DATE: '@steplock/last_reset_date',
  AUTO_RESET: '@steplock/auto_reset',
};
