// src/main.ts
import axios from 'axios';


// 기존 카운터 기능 코드
export function setupCounter(element: HTMLElement) {
  let counter = 0;

  const adjustCounterValue = (value: number) => {
    if (value >= 100) return value - 100;
    if (value <= -100) return value + 100;
    return value;
  };

  const setCounter = (value: number) => {
    counter = adjustCounterValue(value);
    const text = `${counter}`;
    element.innerHTML = text;
  };

  document.getElementById('increaseByOne')?.addEventListener('click', () => setCounter(counter + 1));
  document.getElementById('decreaseByOne')?.addEventListener('click', () => setCounter(counter - 1));
  document.getElementById('increaseByTwo')?.addEventListener('click', () => setCounter(counter + 2));
  document.getElementById('decreaseByTwo')?.addEventListener('click', () => setCounter(counter - 2));

  setCounter(0);
}

setupCounter(document.getElementById('counter-value') as HTMLElement);

// 백엔드 API 호출 (axios 사용)
function fetchUsersWithAxios(): Promise<any> {
  return axios.get('http://localhost:8080/users') // 프록시 대신 전체 URL 사용
    .then(response => {
      const users = response.data;
      console.log('Users (axios):', users);
      const userListElement = document.getElementById('user-list');
      if (userListElement && Array.isArray(users)) {
        userListElement.innerHTML = users.map((user: any) => `<li>${user.name} (${user.email})</li>`).join('');
      }
      return users;
    })
    .catch(error => {
      console.error('Error fetching users with axios:', error);
      return [];
    });
}


// async/await 방식으로 결과값 받아오기
async function loadUsers() {
  const users = await fetchUsersWithAxios();
  console.log('최종 사용자 데이터:', users);
}

loadUsers();