// import React, { useState } from 'react';
// import Notice from '../../../Notice/Notice';
// import AnnouncementBoard from '../AnnouncementBoard/AnnouncementBoard';
// import './AnnouncementMain.css';

// const AnnouncementMain = () => {
//   // Shared announcements state
//   const [announcements, setAnnouncements] = useState([
//     {
//       id: 1,
//       title: '시스템 점검 안내',
//       content: '2025년 5월 3일 오전 2시부터 오전 5시까지 시스템 점검이 예정되어 있습니다. 해당 시간에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
//       date: '2025-05-01',
//       isImportant: true,
//     },
//     {
//       id: 2,
//       title: '새로운 기능 업데이트 안내',
//       content: '사용자 경험 개선을 위한 새로운 기능이 추가되었습니다. 자세한 내용은 공지사항을 확인해 주세요.',
//       date: '2025-04-28',
//       isImportant: false,
//     },
//     {
//       id: 3,
//       title: '개인정보 처리방침 변경 안내',
//       content: '2025년 6월 1일부터 개인정보 처리방침이 변경됩니다. 자세한 내용은 홈페이지에서 확인하실 수 있습니다.',
//       date: '2025-04-25',
//       isImportant: true,
//     },
//   ]);

//   // Handler to add new announcement
//   const handleAddAnnouncement = (newAnnouncement) => {
//     setAnnouncements([newAnnouncement, ...announcements]);
//   };

//   // Handler to delete announcement
//   const handleDeleteAnnouncement = (id) => {
//     setAnnouncements(announcements.filter(announcement => announcement.id !== id));
//   };

//   return (
//     <div className="app">
//       <AnnouncementBoard 
//         announcements={announcements}
//         onAddAnnouncement={handleAddAnnouncement}
//         onDeleteAnnouncement={handleDeleteAnnouncement}
//       />
//       <Notice announcements={announcements} />
//     </div>
//   );
// };

// export default AnnouncementMain;