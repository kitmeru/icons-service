
# Iconify API Service

Этот сервис предоставляет API для получения иконок из библиотеки [Iconify](https://iconify.design/), которая включает множество популярных коллекций иконок. С помощью этого API можно получить коллекции и иконки с пагинацией, превью иконок для отображения на фронте с использованием ленивого скролла.

Этот сервис используется в **Kitme**, конструкторе сайтов для игровых серверов.

## Описание

Этот API позволяет интегрировать иконки из различных коллекций в приложение или сайт, а также получить превью популярных иконок для каждой коллекции с возможностью пагинации.

## Возможности

- **Получение списка коллекций** с мини-превью иконок.
- **Пагинация коллекций** для ленивой загрузки.
- **3 популярных иконки** с каждой коллекции.
- Преобразование иконок в **Data URI** для простого использования в веб-интерфейсе.
- Поддержка **ленивой загрузки** и пагинации на фронте.

## Установка

1. Клонируйте репозиторий:

```bash
  git clone https://github.com/kitmeru/icons-service.git
```

2. Перейдите в папку проекта:

```bash
  cd icons-service
```

3. Установите зависимости:

```bash
  npm install
```

4. Запустите сервер:

```bash
  npm start
```

Сервер будет запущен на `http://localhost:8008`.

## API Endpoints

### 1. Получение списка коллекций

- **Endpoint**: `/collections`
- **Метод**: `GET`
- **Параметры**:
    - `page` (по умолчанию `1`) — Номер страницы.
    - `limit` (по умолчанию `10`) — Количество коллекций на странице.

**Пример запроса**:

```bash
  GET http://localhost:8008/collections?page=1&limit=10
```

**Пример ответа**:

```json
{
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  },
  "collections": [
    {
      "collection": "mdi",
      "name": "Material Design Icons",
      "previews": [
        "data:image/svg+xml;base64,...",
        "data:image/svg+xml;base64,...",
        "data:image/svg+xml;base64,..."
      ]
    },
    {
      "collection": "carbon",
      "name": "Carbon Icons",
      "previews": [
        "data:image/svg+xml;base64,...",
        "data:image/svg+xml;base64,...",
        "data:image/svg+xml;base64,..."
      ]
    }
  ]
}
```

### 2. Как работать с ленивым скроллом

Для использования ленивого скролла на фронте вы можете использовать IntersectionObserver для загрузки следующей порции коллекций, как показано в примере на Vue.

### Пример фронтенда с ленивой загрузкой

```vue
<template>
  <div>
    <div v-for="collection in collections" :key="collection.collection" class="collection-card">
      <h3>{{ collection.name }}</h3>
      <div class="previews">
        <img v-for="(preview, index) in collection.previews" :key="index" :src="preview" alt="Icon Preview" width="32" height="32" />
      </div>
    </div>

    <div v-if="loading" class="loading-indicator">Загрузка...</div>

    <div v-if="hasMore" ref="loadMore" class="load-more">Загрузить еще...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';

// Состояния компонента
const collections = ref([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const hasMore = ref(true);
const loading = ref(false);

// Функция для получения коллекций
const fetchCollections = async () => {
    loading.value = true;
    const response = await fetch(`http://localhost:8008/collections?page=${page.value}&limit=${limit.value}`);
    const data = await response.json();
    
    total.value = data.total;
    hasMore.value = collections.value.length < total.value;
    collections.value = [...collections.value, ...data.collections];
    page.value++;
    loading.value = false;
};

// Загружаем коллекции при монтировании
onMounted(() => {
    fetchCollections();
});

// Наблюдаем за изменением страницы и подгружаем больше данных
watchEffect(() => {
if (hasMore.value && !loading.value) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchCollections();
    }
  }, { threshold: 1 });

  observer.observe(document.querySelector('.load-more'));
}
});
</script>

<style scoped>
.collection-card {
    margin: 16px;
    padding: 16px;
    border: 1px solid #ddd;
    display: inline-block;
}

.previews {
    display: flex;
    gap: 8px;
}

.load-more {
    text-align: center;
    padding: 16px;
    background-color: #f0f0f0;
    cursor: pointer;
    margin-top: 20px;
}

.loading-indicator {
    text-align: center;
    padding: 16px;
    background-color: #f0f0f0;
    margin-top: 20px;
}
</style>
```

## Лицензия

Этот проект использует стандартную лицензию MIT. Для более подробной информации, пожалуйста, ознакомьтесь с файлом [LICENSE](LICENSE).

---

## Важная информация

Этот сервис является частью **Kitme** — конструктора сайтов для игровых серверов. **Kitme** помогает создавать и настраивать сайты для игровых серверов, включая интеграцию с различными сервисами и API, такими как иконки из Iconify.

---

## Контакты

Если у вас возникли вопросы или предложения, вы можете связаться с нами по адресу: [help@kitme.ru](mailto:help@kitme.ru).