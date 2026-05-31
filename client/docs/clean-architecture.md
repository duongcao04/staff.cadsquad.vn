# Clean Architecture cho React + Vite

Tài liệu này mô tả cách tổ chức source code React + Vite theo hướng **Clean Architecture** dành cho dự án Frontend.

Mục tiêu chính là tách rõ:

* Logic nghiệp vụ
* Logic gọi API
* Giao diện React
* State management
* Helper dùng chung

Cấu trúc này phù hợp với các dự án React có quy mô vừa trở lên, cần dễ mở rộng, dễ bảo trì và dễ test.

---

## 1. Cấu trúc thư mục đề xuất

```txt
src/
├── core/
│   ├── entities/
│   └── use-cases/
│
├── data/
│   ├── repositories/
│   └── network/
│
├── presentation/
│   ├── components/
│   ├── hooks/
│   ├── routes/
│   ├── store/
│   └── assets/
│
├── utils/
├── App.tsx
└── main.tsx
```

---

## 2. Ý nghĩa từng tầng

### `core/`

Đây là tầng trung tâm của ứng dụng.

Tầng này không phụ thuộc vào React, Axios, Zustand, Redux hay bất kỳ thư viện UI nào.

```txt
core/
├── entities/
└── use-cases/
```

### `core/entities/`

Chứa các kiểu dữ liệu chính của ứng dụng.

Ví dụ:

```ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

Có thể hiểu đây là nơi định nghĩa các model hoặc interface quan trọng.

---

### `core/use-cases/`

Chứa logic nghiệp vụ của ứng dụng.

Ví dụ:

```ts
export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string) {
    if (!id) {
      throw new Error('User ID is required');
    }

    return this.userRepository.getUserById(id);
  }
}
```

Use Case không gọi API trực tiếp.

Use Case chỉ làm việc thông qua interface hoặc repository được truyền vào.

---

## 3. Tầng `data/`

Tầng này chịu trách nhiệm làm việc với dữ liệu bên ngoài.

Trong React + Vite, dữ liệu bên ngoài thường là API từ server khác, Firebase, Supabase hoặc localStorage.

```txt
data/
├── repositories/
└── network/
```

---

### `data/network/`

Chứa cấu hình API client.

Ví dụ:

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});
```

---

### `data/repositories/`

Chứa phần triển khai thực tế của repository.

Ví dụ:

```ts
import { apiClient } from '../network/apiClient';
import type { User, UserRepository } from '../../core/entities/User';

export class UserRepositoryImpl implements UserRepository {
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);

    return response.data;
  }
}
```

Repository là nơi gọi API, xử lý response và mapping dữ liệu nếu cần.

---

## 4. Tầng `presentation/`

Đây là tầng giao diện của ứng dụng.

Tầng này chứa React component, page, hook, state và asset.

```txt
presentation/
├── components/
├── hooks/
├── routes/
├── store/
└── assets/
```

---

### `presentation/components/`

Chứa các component dùng chung.

Ví dụ:

```txt
components/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
└── Loading.tsx
```

Component trong thư mục này nên có tính tái sử dụng cao.

---

### `presentation/routes/`

Chứa các trang chính của ứng dụng.

Ví dụ:

```txt
routes/
├── HomePage.tsx
├── UserProfilePage.tsx
└── LoginPage.tsx
```

Page thường là nơi ghép nhiều component lại với nhau.

---

### `presentation/hooks/`

Chứa custom hooks dùng để kết nối UI với use case.

Ví dụ:

```ts
import { useEffect, useState } from 'react';
import { GetUserUseCase } from '../../core/use-cases/GetUserUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';
import type { User } from '../../core/entities/User';

const userRepository = new UserRepositoryImpl();
const getUserUseCase = new GetUserUseCase(userRepository);

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getUserUseCase
      .execute(id)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);

  return {
    user,
    loading,
  };
}
```

Component không nên gọi API trực tiếp.

Component nên gọi custom hook.

Custom hook sẽ gọi use case.

---

### `presentation/store/`

Chứa global state.

Có thể dùng:

* Zustand
* Redux Toolkit
* Context API
* Jotai
* Recoil

Ví dụ:

```txt
store/
├── authStore.ts
└── themeStore.ts
```

Không nên đưa toàn bộ business logic vào store.

Store chỉ nên quản lý trạng thái dùng chung.

---

### `presentation/assets/`

Chứa tài nguyên giao diện.

Ví dụ:

```txt
assets/
├── images/
├── icons/
├── fonts/
└── styles/
```

---

## 5. Tầng `utils/`

Chứa các helper nhỏ, không phụ thuộc vào logic nghiệp vụ chính.

Ví dụ:

```txt
utils/
├── formatDate.ts
├── formatCurrency.ts
└── storage.ts
```

Ví dụ:

```ts
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}
```

---

## 6. Ví dụ thực tế: Hiển thị thông tin User

Luồng xử lý:

```txt
UserProfilePage
↓
useUser hook
↓
GetUserUseCase
↓
UserRepository
↓
API Client
```

---

### Bước 1: Định nghĩa Entity

File:

```txt
src/core/entities/User.ts
```

```ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserRepository {
  getUserById(id: string): Promise<User>;
}
```

---

### Bước 2: Tạo Repository gọi API

File:

```txt
src/data/repositories/UserRepositoryImpl.ts
```

```ts
import type { User, UserRepository } from '../../core/entities/User';
import { apiClient } from '../network/apiClient';

export class UserRepositoryImpl implements UserRepository {
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);

    return response.data;
  }
}
```

---

### Bước 3: Tạo Use Case

File:

```txt
src/core/use-cases/GetUserUseCase.ts
```

```ts
import type { User, UserRepository } from '../entities/User';

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    return this.userRepository.getUserById(id);
  }
}
```

---

### Bước 4: Tạo Custom Hook

File:

```txt
src/presentation/hooks/useUser.ts
```

```ts
import { useEffect, useState } from 'react';
import type { User } from '../../core/entities/User';
import { GetUserUseCase } from '../../core/use-cases/GetUserUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';

const userRepository = new UserRepositoryImpl();
const getUserUseCase = new GetUserUseCase(userRepository);

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getUserUseCase
      .execute(id)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return {
    user,
    loading,
  };
}
```

---

### Bước 5: Sử dụng trong Page

File:

```txt
src/presentation/pages/UserProfilePage.tsx
```

```tsx
import { useUser } from '../hooks/useUser';

type UserProfilePageProps = {
  userId: string;
};

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const { user, loading } = useUser(userId);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div>
      <h1>Xin chào, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

---

## 7. Cấu hình Alias cho Vite

Để tránh import quá dài như:

```ts
import { User } from '../../../../core/entities/User';
```

Nên cấu hình alias.

---

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@data': path.resolve(__dirname, './src/data'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@data/*": ["src/data/*"],
      "@presentation/*": ["src/presentation/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

Sau khi cấu hình alias, có thể import gọn hơn:

```ts
import type { User } from '@core/entities/User';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
```

---

## 8. Nguyên tắc quan trọng

### Không gọi API trực tiếp trong Component

Không nên làm như sau:

```tsx
useEffect(() => {
  axios.get('/users/1').then(...)
}, []);
```

Nên gọi qua hook, use case và repository.

---

### Không đưa React vào `core/`

Tầng `core/` không nên import:

```ts
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
```

`core/` chỉ nên chứa TypeScript thuần.

---

### Không over-engineer

Clean Architecture không phải lúc nào cũng cần thiết.

Không nên áp dụng quá cứng nhắc cho:

* Landing page nhỏ
* Website giới thiệu đơn giản
* Dự án chỉ có vài component
* App CRUD rất nhỏ

Nên áp dụng khi dự án có:

* Nhiều feature
* Nhiều màn hình
* Nhiều API
* Logic nghiệp vụ rõ ràng
* Cần dễ test và dễ mở rộng

---

## 9. Khi nào nên dùng cấu trúc này?

Nên dùng khi dự án React + Vite có quy mô vừa hoặc lớn.

Ví dụ:

* Dashboard quản trị
* E-commerce frontend
* CRM frontend
* Booking system
* App quản lý công việc
* App có nhiều module nghiệp vụ

Không nên dùng nếu chỉ làm một landing page đơn giản.

---

## 10. Tóm tắt luồng Clean Architecture

```txt
Presentation
React UI, Page, Hook, Store

↓ gọi

Use Case
Xử lý nghiệp vụ

↓ gọi

Repository Interface
Định nghĩa cách lấy dữ liệu

↓ được implement bởi

Data Repository
Gọi API, localStorage, Firebase, Supabase

↓ sử dụng

Network Client
Axios, Fetch, GraphQL Client
```

---

## 11. Kết luận

Clean Architecture trong React + Vite giúp source code rõ ràng, dễ mở rộng và dễ bảo trì hơn.

Nguyên tắc quan trọng nhất là:

```txt
UI không gọi API trực tiếp.
Use Case không phụ thuộc React.
Core không phụ thuộc thư viện bên ngoài.
Data chịu trách nhiệm lấy dữ liệu.
Presentation chịu trách nhiệm hiển thị giao diện.
```

Nếu tuân thủ đúng các tầng này, dự án React + Vite sẽ sạch hơn, dễ test hơn và dễ phát triển lâu dài hơn.
