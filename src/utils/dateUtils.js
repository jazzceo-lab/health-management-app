import { format, parse, differenceInDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  return format(date, formatStr, { locale: ko });
};

export const formatDateKorean = (date) => {
  return format(date, 'yyyy년 MM월 dd일 EEEE', { locale: ko });
};

export const getDayName = (date) => {
  return format(date, 'EEEE', { locale: ko });
};

export const parseDate = (dateStr) => {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
};

export const getTodayDate = () => {
  return formatDate(new Date());
};

export const calculateDDay = (deadline) => {
  const today = startOfDay(new Date());
  const deadlineDate = startOfDay(new Date(deadline));
  const daysRemaining = differenceInDays(deadlineDate, today);

  return {
    daysRemaining,
    isPassed: daysRemaining < 0,
    isToday: daysRemaining === 0,
  };
};

export const getWeekRange = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일부터 시작
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return {
    start: formatDate(start),
    end: formatDate(end),
    startDate: start,
    endDate: end,
  };
};

export const getWeekDays = (date = new Date()) => {
  const weekRange = getWeekRange(date);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekRange.startDate);
    day.setDate(day.getDate() + i);
    days.push({
      date: formatDate(day),
      dayName: getDayName(day),
      day: day.getDate(),
    });
  }

  return days;
};

export const formatTime = (time) => {
  // "HH:mm" 형식의 시간을 "HH:mm" 또는 "오전/오후 HH:mm" 형태로 변환
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
