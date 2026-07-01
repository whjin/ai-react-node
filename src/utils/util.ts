export const formatTime = (timestamp: number, type: number = 3) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // 补零工具：小于10前面加0
  const padZero = (num: number) => (num < 10 ? '0' + num : num);

  switch (type) {
    case 1:
      // 2026年7月1日16:21:34
      return `${year}年${month}月${day}日${hour}:${minute}:${second}`;
    case 2:
      // 2026-7-1 16:21:39
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    case 3:
      // 2026-07-01 16:21:49（补零标准格式）
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
    default:
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
  }
};
