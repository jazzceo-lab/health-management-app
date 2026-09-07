import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('알림 권한이 필요합니다.');
    return;
  }
};

export const scheduleMedicationNotification = async (medicationName, time) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '복약 알림',
        body: `${medicationName} 복용 시간입니다.`,
        sound: 'default',
        badge: 1,
        data: {
          type: 'medication',
          medication: medicationName,
          time: time,
        },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('알림 스케줄링 실패:', error);
  }
};

export const cancelNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
